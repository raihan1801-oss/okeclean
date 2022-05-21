import type { FastifyPluginAsync } from 'fastify';
import type EnvJson from 'project/.env.json';
import type {
	Env,
	ServerSentEvent,
	JWTPayload,
	ToMultipart,
	WithJWT,
	ToOptional,
	RequestBodyFile,
	ToDownload,
	WebSocketMessage,
} from 'project/global';

import type { Stat, Data, User, Slide } from 'schemas/v0-alpha.1/admin';
// @ts-ignore
import type { Multipart, MultipartFields } from 'fastify-multipart';

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import faker from 'faker';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import chalk from 'chalk';
import { ansiToHtml } from 'anser';
import { EventEmitter } from 'events';
import Api from 'utility/api';
import { Data as DataUtility } from 'utility/data';
import { FileStorage } from 'utility/storage';

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: {
			PROJECT_ROOT_DIR,
			SERVER_PUBLIC_DIR,
			SERVER_STATIC_PATH,
			SERVER_LOGS_DIR,
			MODEL_URL,
		},
	} = process as Env<typeof EnvJson>;
	const api = 'admin';
	const version = 'v0-alpha.1';
	const { jwt, orm, rbac, totp, event, wss, sse } = server;
	const model = [
		'buyer',
		'seller',
		'courier',
		'internal',
		'subscriber',
		'order',
		'store',
		'product',
		'delivery',
		'cart',
		'selected-item',
		'group-order',
		'ordered-item',
	];
	const modelEvent = new EventEmitter();
	const slide_image_path = path.join(SERVER_PUBLIC_DIR, 'slides');
	const slide_image_static_path = path.join(SERVER_STATIC_PATH, 'slides');
	const file_storage = new FileStorage({ root: SERVER_PUBLIC_DIR });
	const dataPath = path.join(PROJECT_ROOT_DIR, 'data.json');
	const data_store = DataUtility.create<Data>({
		path: dataPath,
		schema: {
			business: {
				type: 'object',
				props: {
					productPriceIncrease: 'number',
					productPriceIncreaseActive: 'boolean',
					deliveryCostCalculatePerDistance: 'number',
					deliveryCostCalculatePerDistanceActive: 'boolean',
					deliveryCostCalculatePerWeight: 'number',
					deliveryCostCalculatePerWeightActive: 'boolean',
				},
			},
			model: {
				type: 'object',
				props: {
					open: 'boolean',
					openBy: 'string',
					openAt: 'string',
					link: 'string',
				},
			},
			slides: {
				type: 'array',
				items: {
					type: 'object',
					props: {
						id: 'number',
						src: 'string',
						href: 'string',
					},
				},
			},
		},
		verbose: false,
	});

	await fs.mkdir(slide_image_path, { recursive: true });

	for (const table of model) {
		event.on(`model:${table}:change`, (args: any) => {
			modelEvent.emit('change', {
				tag: `model:${table}:change`,
				data: args,
			} as ServerSentEvent);
		});
	}

	sse.route({
		path: `/${api}`,
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			modelEvent.on('change', listener);
			reply.once('close', () => modelEvent.removeListener('change', listener));
			function listener(arg: any) {
				reply.send('message', arg);
			}
		},
	});

	server.route<{}>({
		url: `/${api}/stat`,
		method: 'GET',
		handler: async (request, reply) => {
			// const user = await request.identify('admin');
			// const buyer = await orm.buyer.count();
			// const seller = await orm.seller.count();
			// const courier = await orm.courier.count();
			const user = await orm.user.count();
			const orders = await orm.transaction.findMany();
			// const product = await orm.product.count();
			// const subscriber = await orm.subscriber.count();
			// const orderCost = await orm.order.aggregate({
			// 	_sum: {
			// 		cost: true,
			// 	},
			// 	where: {
			// 		status: { in: ['Done'] },
			// 	},
			// });
			// const deliveryCost = await orm.delivery.aggregate({
			// 	_sum: {
			// 		cost: true,
			// 	},
			// 	where: {
			// 		status: 'Done',
			// 	},
			// });
			let sales = 0;
			for (const order of orders) {
				if (order.status == "finish") {
					sales += order.cost.toNumber();
				}
			}
			reply.ok<Stat>({
				user,
				order: orders.length,
				sales,
			});
		},
		schema: {},
	});

	server.route<{}>({
		url: `/${api}/business`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const data = await data_store.load();
			reply.ok(data.business);
		},
		schema: {},
	});

	server.route<{
		Body: Data['business'];
	}>({
		url: `/${api}/business`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const data = await data_store.load();
			data.business = request.body;
			await data_store.save();
			reply.ok(data.business);
		},
		schema: {},
	});

	server.route<{}>({
		url: `/${api}/model`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const data = await data_store.load();
			reply.ok(data.model);
		},
		schema: {},
	});

	server.route<{
		Body: Data['model'];
	}>({
		url: `/${api}/model`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const result = await orm.user.findUnique({
				where: { id: user.sub },
			});
			if (!result) {
				throw Api.Error.FailedAuthentication('Unknown User');
			}
			const data = await data_store.load();
			if (request.body.open) {
				const child = spawn('npm run pm2:start:model', [], {
					cwd: PROJECT_ROOT_DIR,
					shell: true,
				});

				child.on('spawn', async () => {
					data.model.open = true;
					data.model.link = MODEL_URL;
					data.model.openBy = result.name;
					data.model.openAt = new Date().toISOString();

					await data_store.save();

					reply.ok(data.model);
					event.emit('data:changed', data);
				});
			} else {
				const studio = spawn('npm run pm2:stop:model', [], {
					cwd: PROJECT_ROOT_DIR,
					shell: true,
				});

				studio.on('spawn', async () => {
					data.model.open = false;
					data.model.link = '';
					data.model.openBy = '';
					data.model.openAt = '';

					await data_store.save();

					reply.ok(data.model);
					event.emit('data:changed', data);
				});
			}
			return reply;
		},
		schema: {},
	});

	server.route<{}>({
		url: `/${api}/slide`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const data = await data_store.load();
			reply.ok(data.slides);
		},
		schema: {},
	});
	// server.route<{
	// 	Body: Slide[];
	// }>({
	// 	url: `/${api}/slide`,
	// 	method: 'PATCH',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify('admin');
	// 		const data = await data_store.load();

	// 		for (const slide of data.slides) {
	// 			const pass = request.body.some((item) => item.id == slide.id);
	// 			if (!pass) {
	// 				await fs.remove(
	// 					path.join(slide_image_path, path.basename(slide.src))
	// 				);
	// 			}
	// 		}

	// 		data.slides = request.body;

	// 		await data_store.save();

	// 		reply.ok(data.slides);
	// 	},
	// 	schema: {},
	// });
	// server.route<{}>({
	// 	url: `/${api}/slide/image`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify('admin');
	// 		const data = await data_store.load();

	// 		for await (const part of request.files()) {
	// 			const id = +part.fieldname;
	// 			const filename = path.join(id + path.extname(part.filename));
	// 			await new Promise<void>((resolve) => {
	// 				part.file
	// 					.pipe(fs.createWriteStream(path.join(slide_image_path, filename)))
	// 					.on('finish', () => {
	// 						resolve();
	// 					});
	// 			});
	// 			const slide = data.slides.find((slide) => slide.id == id) as any;
	// 			if (slide) {
	// 				slide.src = path.join(slide_image_static_path, filename);
	// 			}
	// 		}

	// 		await data_store.save();

	// 		reply.ok();
	// 	},
	// 	schema: {},
	// });

	server.route<{
		Params: { role: string; id: string };
	}>({
		url: `/${api}/user/:role-:id`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const users: User[] = [];
			const { role, id } = request.params;
			if (role == 'buyer') {
				const buyer = await orm.buyer.findFirst({
					where: { id: +id },
					include: { address: { take: 1, where: { selected: true } } },
					rejectOnNotFound: true,
				});
				users.push({
					id: buyer.id,
					node: buyer.chatNodeId,
					role: buyer.role,
					username: buyer.username,
					email: buyer.email,
					telp: buyer.telp,
					address: buyer.address[0]?.value,
					image: buyer.image,
				});
			} else if (role == 'seller') {
				const seller = await orm.seller.findFirst({
					where: { id: +id },
					include: { store: true },
					rejectOnNotFound: true,
				});
				users.push({
					id: seller.id,
					node: seller.store?.chatNodeId ?? 0,
					role: seller.role,
					username: seller.username,
					email: seller.email,
					telp: seller.store?.telp,
					address: seller.store?.address,
					image: seller.store?.image,
				});
			} else if (role == 'courier') {
				const courier = await orm.courier.findFirst({
					where: { id: +id },
					rejectOnNotFound: true,
				});
				users.push({
					id: courier.id,
					node: courier.chatNodeId,
					role: courier.role,
					username: courier.username,
					email: courier.email,
					telp: courier.telp,
					address: courier.address,
					image: courier.image,
				});
			}
			reply.ok(users[0]);
		},
		schema: {},
	});
	server.route({
		url: `/${api}/user`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const buyers = await orm.buyer.findMany({
				include: { address: { take: 1, where: { selected: true } } },
			});
			const sellers = await orm.seller.findMany({ include: { store: true } });
			const couriers = await orm.courier.findMany();
			const users: User[] = [];

			for (const buyer of buyers) {
				users.push({
					id: buyer.id,
					node: buyer.chatNodeId,
					role: buyer.role,
					username: buyer.username,
					email: buyer.email,
					telp: buyer.telp,
					address: buyer.address[0]?.value,
					image: buyer.image,
				});
			}
			for (const seller of sellers) {
				users.push({
					id: seller.id,
					node: seller.store?.chatNodeId ?? 0,
					role: seller.role,
					username: seller.username,
					email: seller.email,
					telp: seller.store?.telp,
					address: seller.store?.address,
					image: seller.store?.image,
				});
			}
			for (const courier of couriers) {
				users.push({
					id: courier.id,
					node: courier.chatNodeId,
					role: courier.role,
					username: courier.username,
					email: courier.email,
					telp: courier.telp,
					address: courier.address,
					image: courier.image,
				});
			}
			reply.ok(users);
		},
		schema: {},
	});

	server.route<{
		Params: { id: string };
	}>({
		url: `/${api}/product/:id`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const products = await orm.product.findFirst({
				where: { id: +request.params.id },
				include: { store: true },
				rejectOnNotFound: true,
			});
			reply.ok(products);
		},
		schema: {},
	});
	server.route<{}>({
		url: `/${api}/product`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const products = await orm.product.findMany({ include: { store: true } });
			reply.ok(products);
		},
		schema: {},
	});

	server.route<{
		Params: { id: string };
	}>({
		url: `/${api}/order/:id`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const order = await orm.order.findFirst({
				where: { id: +request.params.id },
				include: {
					item: { include: { product: true } },
					delivery: {
						include: {
							sender: true,
							recipient: { include: { buyer: true } },
							courier: true,
						},
					},
				},
				rejectOnNotFound: true,
			});
			reply.ok(order);
		},
		schema: {},
	});
	server.route<{}>({
		url: `/${api}/order`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const orders = await orm.order.findMany({
				include: {
					item: { include: { product: true } },
					delivery: { include: { sender: true, recipient: true } },
				},
			});
			reply.ok(orders);
		},
		schema: {},
	});

	server.route<{
		Params: { id: string };
	}>({
		url: `/${api}/sales/:id`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const sale = await orm.order.findFirst({
				where: { AND: [{ status: 'Done' }, { id: +request.params.id }] },
				include: {
					buyer: true,
					item: { include: { product: true } },
					delivery: {
						include: {
							sender: true,
							recipient: true,
							courier: true,
						},
					},
					rating: true,
				},
				rejectOnNotFound: true,
			});
			reply.ok(sale);
		},
		schema: {},
	});
	server.route<{}>({
		url: `/${api}/sales`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const sales = await orm.order.findMany({
				where: { status: 'Done' },
				include: {
					buyer: true,
					store: true,
					item: { include: { product: true } },
					delivery: true,
					rating: true,
				},
			});
			reply.ok(sales);
		},
		schema: {},
	});

	server.route<{}>({
		url: `/${api}/subscribers`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const subscribers = await orm.subscriber.findMany();
			reply.ok(subscribers);
		},
		schema: {},
	});
	server.route<{
		Params: { id: string };
	}>({
		url: `/${api}/unsubscribe/:id`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const subscriber = await orm.subscriber.delete({
				where: { id: +request.params.id },
			});
			reply.ok(subscriber);
			event.emit('model:subscriber:change', subscriber);
		},
		schema: {},
	});

	sse.route({
		path: `/${api}/log`,
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const dir = path.join(SERVER_LOGS_DIR, 'server.log');
			const buffer = await fs.readFile(dir);

			fs.watchFile(dir, listener);

			reply
				.once('close', () => {
					fs.unwatchFile(dir, listener);
				})
				.send('data', {
					tag: 'initial',
					data: ansiToHtml(buffer.toString()),
				});

			return reply;

			function listener(curr: fs.Stats, prev: fs.Stats) {
				let text = '';

				fs.createReadStream(dir, { start: prev.size })
					.on('data', (chunk) => (text += chunk))
					.once('close', () => {
						reply.send('data', { tag: 'continue', data: ansiToHtml(text) });
					});
			}
		},
	});
	server.route<{}>({
		url: `/${api}/log`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			reply.send(fs.createReadStream(path.join(SERVER_LOGS_DIR, 'server.log')));
		},
		schema: {},
	});
	server.route<{}>({
		url: `/${api}/log`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			await fs.writeFile(path.join(SERVER_LOGS_DIR, 'server.log'), '');
			reply.ok(true);
		},
		schema: {},
	});

	server.route<{
		Body: {};
	}>({
		url: `/${api}/folder`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const tree = await file_storage.dir_tree(
				SERVER_PUBLIC_DIR,
				SERVER_STATIC_PATH
			);
			reply.ok(tree);
		},
		schema: {},
	});
	server.route<{
		Params: { '*': string };
	}>({
		url: `/${api}/folder/public/*`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const dir_file = await file_storage.save_file(request.raw, {
				path: request.params['*'],
				href: SERVER_STATIC_PATH,
			});

			reply.created(dir_file);
		},
		schema: {},
	});
	server.route<{
		Params: { '*': string };
	}>({
		url: `/${api}/folder/public/*`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const user = await request.identify('admin');
			const result = await file_storage.remove_file(request.params['*']);
			reply.ok(result);
		},
		schema: {},
	});
};

export default route;
