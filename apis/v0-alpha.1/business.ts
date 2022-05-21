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
} from 'project/global';

import type {
	Store,
	Item,
	Product,
	Order,
	CheckoutData,
	OrderData,
} from 'schemas/v0-alpha.1/business';

import fs from 'fs-extra';
import path from 'path';
import faker from 'faker';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import Api from 'utility/api';

import data_json from 'project/data.json';

import { FileStorage } from 'utility/storage';

type Data = typeof data_json;

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: { PROJECT_ROOT_DIR, SERVER_STATIC_PATH, SERVER_PUBLIC_DIR },
	} = process as Env<typeof EnvJson>;
	const api = 'business';
	const { jwt, orm, rbac, totp } = server;
	const data_json_path = path.join(PROJECT_ROOT_DIR, 'data.json');
	const FILE_DIR = path.join(SERVER_PUBLIC_DIR, api);
	const IMAGE_DIR = path.join(FILE_DIR, 'image');
	const IMAGE_STATIC = path.join(SERVER_STATIC_PATH, api, 'image');
	const image = new FileStorage({ root: IMAGE_DIR });

	server.route<{}>({
		url: `/${api}`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			reply.ok(data_json);
		},
		schema: {},
	});

	server.route<{}>({
		url: `/${api}/slide`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await loadData();
			reply.ok(data.slides);
		},
		schema: {},
	});
	// server.route<{}>({
	// 	url: `/${api}/slide`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const file = await request.file();
	// 		const data = await loadData();
	// 		console.log(file);
	// 		reply.ok();
	// 	},
	// 	schema: {},
	// });

	server.route<{
		Body: {};
	}>({
		url: `/${api}/checkout`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			reply.notImplemented();
		},
		schema: {},
	});
	server.route<{
		Body: OrderData;
	}>({
		url: `/${api}/order`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const { address, buyer, items, range, weight, item } = request.body;
			const result = await orm.$transaction(async (orm) => {
				const rangeUnit = 'm';
				const weightUnit = 'kg';
				let totalRange = 0;
				let totalWeight = 0;
				let totalOrderCost = 0;
				let totalDeliveryCost = 0;
				let totalCost = 0;

				const originalAddress = await orm.buyerAddress.findFirst({
					where: {
						AND: [
							{ id: address.id },
							{ name: address.name },
							{ telp: address.telp },
							{ position: { equals: address.position } },
						],
					},
				});
				if (!originalAddress) {
					const result = await orm.buyerAddress.create({
						data: {
							name: address.name,
							telp: address.telp,
							label: 'Anonym',
							selected: false,
							pinned: true,
							detail: '',
							area: address.area,
							local: address.local,
							place: address.place,
							value: address.value,
							position: address.position,
							buyerId: buyer.id,
						},
					});
					address.id = result.id;
				}
				if (item) {
					const result = await orm.selectedItem.create({
						data: {
							amount: item.amount,
							checked: true,
							productId: item.productId,
						},
						include: {
							product: {
								include: {
									store: true,
								},
							},
						},
					});
					items.push(result);
					server.event.emit(`model:selected-item:change`, result);
				}
				const group = await orm.groupOrder.create({
					data: {
						status: 'Queue',
						orderCost: totalOrderCost,
						deliveryCost: totalDeliveryCost,
						totalCost,
						buyerId: buyer.id,
						addressId: address.id,
						weight: totalWeight,
						weightUnit,
						range: totalRange,
						rangeUnit,
					},
				});

				server.event.emit(`model:group-order:change`, group);

				const order: Order[] = [];
				const ids = new Set<number>();
				const stores = items.reduce((prev, curr) => {
					const id = curr.product.store.id;
					if (ids.has(id)) {
						prev.find((store) => store.id == id)?.items.push(curr);
					} else {
						ids.add(id);
						prev.push({
							...curr.product.store,
							items: [curr],
						});
					}
					return prev;
				}, [] as (Store & { items: (Item & { product: Product })[] })[]);
				let index = 0;
				for (const store of stores) {
					const localRange = range[index];

					let deliveryCost = Math.round(
						data_json.business.deliveryCostCalculatePerDistance *
							(localRange / 1000)
					);

					totalRange += localRange;
					totalDeliveryCost += deliveryCost;

					let orderCost = 0;
					let weight = 0;

					for (const item of store.items) {
						orderCost += item.amount * +item.product.price;
						weight += item.amount * item.product.weight;
						totalOrderCost += orderCost;
						totalWeight += weight;
					}
					const delivery = await orm.delivery.create({
						data: {
							status: 'Queue',
							cost: deliveryCost,
							range: localRange,
							weight,
							rangeUnit,
							weightUnit,
							senderId: store.id,
							recipientId: address.id,
						},
					});
					order.push(
						await orm.order.create({
							data: {
								status: 'Queue',
								cost: orderCost,
								weight,
								weightUnit,
								buyerId: buyer.id,
								groupOrderId: group.id,
								storeId: store.id,
								deliveryId: delivery.id,
								item: {
									createMany: {
										data: store.items.map((item) => {
											return {
												status: 'Queue',
												amount: item.amount,
												price: item.product.price,
												selectedItem: item as any,
												productId: item.product.id,
											};
										}),
									},
								},
							},
						})
					);
					index++;
				}
				server.event.emit(`model:order:change`);
				server.event.emit(`model:delivery:change`);
				for (const item of items) {
					await orm.selectedItem.delete({
						where: { id: item.id },
					});
				}
				server.event.emit(`model:selected-item:change`);
				if (!item) {
					await orm.cart.update({
						where: { id: items[0].cartId as number },
						data: {
							checked: false,
						},
					});
				}
				server.event.emit(`model:cart:change`);
				return orm.groupOrder.update({
					where: { id: group.id },
					data: {
						range: totalRange,
						weight: totalWeight,
						orderCost: totalOrderCost,
						deliveryCost: totalDeliveryCost,
						totalCost: totalOrderCost + totalDeliveryCost,
						order: { connect: order.map(({ id }) => ({ id })) },
					},
				});
			});
			reply.created(result);
			server.event.emit(`model:group-order:change`, result);
		},
		schema: {},
	});

	function saveData(data: Data) {
		return fs.writeFile(data_json_path, JSON.stringify(data, null, '\t'));
	}
	async function loadData() {
		const buf = await fs.readFile(data_json_path);
		return JSON.parse(buf.toString()) as Data;
	}
};

export default route;
