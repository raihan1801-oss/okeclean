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
	Data,
	DataHistory,
	GetQuery,
	SearchQuery,
	CreateQuery,
	UpdateQuery,
	UpsertQuery,
	DeleteQuery,
	AggregateQuery,
	GroupQuery,
	BatchQuery,
	SearchManyQuery,
	CreateManyQuery,
	UpdateManyQuery,
	DeleteManyQuery,
	ValidateQuery,
	QueringGet,
	QueringSearch,
	QueringCreate,
	QueringUpdate,
	QueringUpsert,
	QueringDelete,
	QueringAggregate,
	QueringGroup,
	QueringBatch,
	QueringSearchMany,
	QueringCreateMany,
	QueringUpdateMany,
	QueringDeleteMany,
} from 'schemas/v0-alpha.1/product';

import Api from 'utility/api';

import { ProductModel } from 'models/product';
import { FileStorage } from 'utility/storage';

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: { SERVER_PUBLIC_DIR, SERVER_STATIC_PATH },
	} = process as Env<typeof EnvJson>;
	const api = 'product';
	const { jwt, orm, rbac, totp } = server;
	const IMAGE_DIR = FileStorage.path.join(SERVER_PUBLIC_DIR, api, 'image');
	const IMAGE_STATIC = FileStorage.path.join(SERVER_STATIC_PATH, api, 'image');
	const image = new FileStorage({ root: IMAGE_DIR });
	const model = new ProductModel(orm);

	await image.init();

	server.route<{}>({
		url: `/${api}/get`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.searchMany({
				where: { forSale: true },
				include: { store: true },
			});
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{ Params: { id: string } }>({
		url: `/${api}/get/:id`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.search({
				where: { AND: [{ forSale: true }, { id: +request.params.id }] },
				include: { store: true },
			});
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: SearchQuery;
	}>({
		url: `/${api}/search`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.search(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: CreateQuery;
	}>({
		url: `/${api}/create`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.setInfo(user).create(request.body);
			reply.created(data);
			server.event.emit(`model:${api}:change`, data);
		},
		schema: {},
	});

	server.route<{
		Body: UpdateQuery;
	}>({
		url: `/${api}/update`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.setInfo(user).update(request.body);
			reply.ok(data);
			server.event.emit(`model:${api}:change`, data);
		},
		schema: {},
	});

	server.route<{
		Body: UpsertQuery;
	}>({
		url: `/${api}/upsert`,
		method: 'PUT',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.setInfo(user).upsert(request.body);
			reply.ok(data);
			server.event.emit(`model:${api}:change`, data);
		},
		schema: {},
	});

	server.route<{
		Body: DeleteQuery;
	}>({
		url: `/${api}/delete`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.delete(request.body);
			reply.ok(data);
			server.event.emit(`model:${api}:change`, data);
		},
		schema: {},
	});

	server.route<{
		Body: AggregateQuery;
	}>({
		url: `/${api}/aggrerate`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.aggrerate(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: GroupQuery;
	}>({
		url: `/${api}/group`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.group(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: BatchQuery[];
	}>({
		url: `/${api}/batch`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const result = await model.setInfo(user).batch(request.body);
			model.unsetInfo();
			reply.ok(result);
		},
		schema: {},
	});

	server.route<{
		Body: SearchManyQuery;
	}>({
		url: `/${api}/searchMany`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.searchMany(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: CreateManyQuery;
	}>({
		url: `/${api}/createMany`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.createMany(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: UpdateManyQuery;
	}>({
		url: `/${api}/updateMany`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.updateMany(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: DeleteManyQuery;
	}>({
		url: `/${api}/deleteMany`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.deleteMany(request.body);
			reply.ok(data);
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
