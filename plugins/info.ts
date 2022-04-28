import type { FastifyPluginAsync } from 'fastify';
import type EnvJson from 'project/.env.json';
import type { Env, WebPushPayload, WebPushResponse } from 'project/global';
import type { Data } from 'schemas/v0-alpha.1/admin';

import wrapper from 'fastify-plugin';
import fs from 'fs-extra';
import path from 'path';
import glob from 'fast-glob';
import webpush from 'web-push';
import { SubscriberModel, Data as Subscriber } from 'models/subscriber';

interface Options {
	root: string;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'info';
const plugin: Plugin = async (app, opts) => {
	const { orm, event, mail } = app;
	const {
		env: { VAPID_PUBLIC_KEY_DIR, VAPID_PRIVATE_KEY_DIR, SERVER_URL },
	} = process as Env<typeof EnvJson>;
	const modelSubscriber = new SubscriberModel(orm);
	const web_push_public_key = await fs.readFile(
		path.join(VAPID_PUBLIC_KEY_DIR, 'vapid-public.pem')
	);
	const web_push_private_key = await fs.readFile(
		path.join(VAPID_PRIVATE_KEY_DIR, 'vapid-private.pem')
	);

	webpush.setVapidDetails(
		SERVER_URL,
		web_push_public_key.toString(),
		web_push_private_key.toString()
	);

	app.route<{
		Body: {};
	}>({
		url: `/server/push/key`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			reply.send(web_push_public_key);
		},
		schema: {},
	});
	app.route<{
		Body: {
			role: string;
			userId: number;
			nodeId: number;
			subscription: PushSubscription;
		};
	}>({
		url: `/server/push/subs`,
		method: 'POST',
		handler: async (request, reply) => {
			const data = await modelSubscriber.create({
				data: {
					role: request.body.role,
					userId: request.body.userId,
					nodeId: request.body.nodeId,
					subcription: request.body.subscription as any,
				},
			});
			reply.created(data);
			event.emit('model:subscriber:change', data);
		},
		schema: {},
	});
	app.route<{
		Body: { nodeId: number };
	}>({
		url: `/server/push/unsubs`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const data = await modelSubscriber.deleteMany({
				where: { nodeId: request.body.nodeId },
			});
			reply.ok(data);
			event.emit('model:subscriber:change', data);
		},
		schema: {},
	});
	app.route<{
		Body: WebPushPayload;
	}>({
		url: `/server/push/broadcast`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const result: WebPushResponse = {
				state: 'failed',
				message: 'Something wrong',
			};
			let pass = 0;
			let subscribers: Subscriber[] = [];
			if (request.body.subscribers.includes('*')) {
				subscribers = await modelSubscriber.searchMany({});
			} else if (request.body.subscribers.length) {
				const any = request.body.subscribers[0];
				if (parseInt(any) > 0) {
					subscribers = await modelSubscriber.searchMany({
						where: {
							AND: request.body.subscribers.map((id) => ({ id: +id })),
						},
					});
				} else {
					subscribers = await modelSubscriber.searchMany({
						where: {
							AND: request.body.subscribers.map((role) => ({ role })),
						},
					});
				}
			}
			for (const subscriber of subscribers) {
				try {
					await webpush.sendNotification(
						subscriber.subcription as any,
						JSON.stringify(request.body)
					);
					pass++;
				} catch (error: any) {
					if (error.statusCode == 410) {
						await modelSubscriber.delete({ where: { id: subscriber.id } });
					} else {
						reply.log.error(error);
					}
				}
			}
			if (pass == request.body.subscribers.length) {
				result.state = 'success';
				result.message = `Success broadcast to all (${pass})`;
			} else {
				result.state = 'warn';
				result.message = `Success broadcast to several (${pass})`;
			}
			reply.ok(result);
		},
		schema: {},
	});
	app.route<{
		Body: {
			name: string;
			from: string;
			to: string;
			subject: string;
			message: string;
		};
	}>({
		url: `/server/contact`,
		method: 'POST',
		handler: async (request, reply) => {
			await mail.send({
				from: request.body.from,
				to: request.body.to,
				subject: request.body.subject,
				text: request.body.message,
				replyTo: request.body.from,
			});
			reply.ok();
		},
		schema: {},
	});
};

declare const info: Plugin;
export default wrapper(plugin, { name });
