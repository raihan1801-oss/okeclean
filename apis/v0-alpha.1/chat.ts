import type { FastifyPluginAsync } from 'fastify';
import type EnvJson from 'project/.env.json';
import type {
	Env,
	JWTPayload,
	ToMultipart,
	WithJWT,
	ToOptional,
	RequestBodyFile,
	ToDownload,
	WebPushPayload,
} from 'project/global';

import type {
	Channel,
	ConnectContact,
	CreateContact,
	GetChannel,
	Message,
	ChatMessage,
	Join,
} from 'schemas/v0-alpha.1/chat';

import Api from 'utility/api';

import Chat, {
	ChatReceiveFormat,
	ChatSendFormat,
	Connect,
} from 'features/chat';
import { ChatChannelModel } from 'models/chat-channel';
import { ChatMessageModel } from 'models/chat-message';
import { SubscriberModel } from 'models/subscriber';
import { FileStorage } from 'utility/storage';
import webpush from 'web-push';

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: { SERVER_PUBLIC_DIR, SERVER_STATIC_PATH },
	} = process as Env<typeof EnvJson>;
	const api = 'chat';
	const version = 'v0-alpha.1';
	const { jwt, orm, rbac, totp, wss } = server;
	const IMAGE_DIR = FileStorage.path.join(SERVER_PUBLIC_DIR, api, 'image');
	const IMAGE_STATIC = FileStorage.path.join(SERVER_STATIC_PATH, api, 'image');
	const image = new FileStorage({ root: IMAGE_DIR });
	const chat = new Chat(orm);
	const modelChannel = new ChatChannelModel(orm);
	const modelMessage = new ChatMessageModel(orm);
	const modelSubscriber = new SubscriberModel(orm);
	const channels = wss.getChannels();
	const address = wss.createAddress();

	await image.init();

	chat.event.on('message', async (message: Message) => {
		const data = JSON.stringify({
			tag: 'message',
			data: message,
			status: 'success',
		} as ChatReceiveFormat);
		const channel = channels.broadcast({ key: message.channelId + '', data });
		if (channel) {
			const chat_channel = await modelChannel.get({
				where: { id: +channel.key },
				include: { node: true },
				rejectOnNotFound: true,
			});
			const node: number[] = [];
			for (const recipient of chat_channel.node) {
				node.push(recipient.id);
			}
			const connected: number[] = [];
			for (const id of channel.meta.values()) {
				connected.push(id);
			}
			const push: number[] = [];
			for (const id of node) {
				if (!connected.includes(id)) {
					push.push(id);
				}
			}
			for (const id of push) {
				const subscriber = await modelSubscriber.search({
					where: { nodeId: id },
				});
				if (subscriber) {
					const link =
						subscriber.role == 'buyer'
							? '/chat'
							: '/' + subscriber.role + '/chat';
					const payload: WebPushPayload = {
						tag: 'chat',
						href: link,
						subscribers: [],
						message,
						notifications: {} as any,
					};
					webpush
						.sendNotification(
							subscriber.subcription as any,
							JSON.stringify(payload)
						)
						.catch((error) => {
							if (error.statusCode == 410) {
								modelSubscriber.delete({ where: { id: subscriber.id } });
							} else {
								server.log.error(error);
							}
						});
				}
			}
		}
	});
	chat.event.on('join', (data: Join) => {
		const channel = data.channel[0];
		const message = JSON.stringify({
			tag: 'join',
			data: channel,
			status: 'success',
		} as ChatReceiveFormat);
		if (channel.type == 'PerToGroup') {
			channels.broadcast({ key: channel.id + '', data: message });
		} else {
			address.broadcast({ address: data.to + '', data: message });
		}
	});

	wss.route({
		path: `/${version}/${api}`,
		handler: async (ws, channels) => {
			ws.on('message', async (data, binary) => {
				const message: ChatSendFormat<Connect> = JSON.parse(data.toString());
				if (message.tag == 'connect') {
					const { data } = message;
					address.set(data.nodeId + '', ws);
					for (const channel of data.channel) {
						channels.addClientToChannel(channel.id + '', ws, data.nodeId);
					}
				}
			});
		},
	});

	server.route<{
		Body: GetChannel;
	}>({
		url: `/${api}/channel`,
		method: 'POST',
		handler: async (request, reply) => {
			const result = await chat.getChannel(request.body);
			reply.ok<Channel[]>(result);
		},
		schema: {},
	});

	server.route<{
		Body: CreateContact;
	}>({
		url: `/${api}/create`,
		method: 'POST',
		handler: async (request, reply) => {
			reply.notImplemented();
		},
		schema: {},
	});

	server.route<{
		Body: ConnectContact;
	}>({
		url: `/${api}/connect`,
		method: 'POST',
		handler: async (request, reply) => {
			const result = await chat.connectContact(request.body);
			reply.ok(result);
		},
		schema: {},
	});

	server.route<{
		Body: ChatMessage.CreateQuery;
	}>({
		url: `/${api}/message`,
		method: 'POST',
		handler: async (request, reply) => {
			const data = await modelMessage.create({
				data: request.body.data,
				include: { sender: true, recipient: true, replyFor: true },
			});
			reply.accept({});
			chat.event.emit('message', data);
		},
		schema: {},
	});

	server.route<{
		Params: { '*': string };
	}>({
		url: `/${api}/image/*`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const dirname = FileStorage.path.dirname(request.params['*']);
			const filename = FileStorage.path.basename(request.params['*']);
			const src = FileStorage.path.join(IMAGE_STATIC, request.params['*']);

			await image.saveImage(request.raw, { dirname, filename });

			reply.type('text/plain');
			reply.code(201);
			reply.send(src);

			return reply;
		},
		schema: {},
	});

	server.route<{
		Params: { '*': string };
	}>({
		url: `/${api}/image/*`,
		method: 'GET',
		handler: async (request, reply) => {
			reply.notImplemented();
		},
		schema: {},
	});
};

export default route;
