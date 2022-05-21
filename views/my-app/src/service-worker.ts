/// <reference no-default-lib="true"/>
/// <reference lib="WebWorker" />

import Service from '$lib/service';
import { build, files, version } from '$service-worker';

import type { WebPushPayload } from '$server/global';
import type { Message } from '$server/schemas/v0-alpha.1/chat';

const dev = false;
const service = new Service({
	debug: dev,
	cachename: version,
	resources: ['/', ...build, ...files],
});

service.register(async (instance, context) => {
	context.addEventListener('push', async (event) => {
		const process = instance.promiseify();
		event.waitUntil(process.promise);
		if (event.data) {
			const data = (await event.data.json()) as WebPushPayload;
			if (data.tag == 'broadcast') {
				context.addEventListener('notificationclick', async (event) => {
					const process = instance.promiseify();
					event.waitUntil(process.promise);
					event.notification.close();
					const clients: WindowClient[] =
						(await context.clients.matchAll()) as any;
					for (const client of clients) {
						await client.navigate(data.href);
					}
					process.resolver(null);
				});
				await context.registration.showNotification(
					(data.notifications as any).title,
					data.notifications
				);
			} else if (data.tag == 'clean-up') {
				await instance.clean();
			} else if (data.tag == 'update') {
				await context.registration.update();
			} else if (data.tag == 'chat') {
				const { message } = data as WebPushPayload & {
					message: Message;
				};
				context.addEventListener('notificationclick', async (event) => {
					const process = instance.promiseify();
					event.waitUntil(process.promise);
					event.notification.close();
					const clients: WindowClient[] =
						(await context.clients.matchAll()) as any;
					for (const client of clients) {
						client.navigate(data.href);
					}
					process.resolver(null);
				});
				await context.registration.showNotification(message.sender.name, {
					tag: message.channelId + '',
					body: message.text,
					image: message.image ?? undefined,
					badge: '/logo.png',
					icon: '/logo.png',
					renotify: true,
				});
			}
		}
		process.resolver(null);
	});
});
service.route({
	url: /(chrome-extension:|wss?:).*/,
	method: 'GET',
	handler: async (request, util) => {
		return {
			strategy: 'net-only',
		};
	},
});
service.route({
	url: new RegExp(location.origin + '/(event|server)/' + '.*'),
	method: 'GET',
	handler: async (request, util) => {
		return {
			strategy: 'net-only',
		};
	},
});
service.route({
	url: new RegExp(location.origin + '/api/' + '.*'),
	method: 'GET',
	handler: async (request, util) => {
		return {
			timeout: 1e3,
			retry_interval: 3e3,
			retry_times: 2,
			cache_name: 'api',
			expire: 1e3 * 60 * 60 * 12,
			strategy: 'net-first',
		};
	},
});
service.route({
	url: /.*/,
	method: 'GET',
	handler: async (request, util) => {
		return {
			timeout: 1e3,
			retry_interval: 3e3,
			retry_times: 2,
			cache_name: 'static',
			expire: 1e3 * 60 * 60 * 24,
			strategy: 'cache-first',
		};
	},
});
service.start();
