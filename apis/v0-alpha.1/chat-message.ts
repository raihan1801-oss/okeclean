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
} from 'schemas/v0-alpha.1/chat-message';

import Api from 'utility/api';

import { ChatMessageModel } from 'models/chat-message';
import { FileStorage } from 'utility/storage';

const route: FastifyPluginAsync = async (server, opts) => {
	// const {
	// 	env: { SERVER_PUBLIC_DIR, SERVER_STATIC_PATH },
	// } = process as Env<typeof EnvJson>;
	// const api = 'chat-message';
	// const { jwt, orm, rbac, totp } = server;
	// const IMAGE_DIR = FileStorage.path.join(SERVER_PUBLIC_DIR, api, 'image');
	// const IMAGE_STATIC = FileStorage.path.join(SERVER_STATIC_PATH, api, 'image');
	// const image = new FileStorage({ root: IMAGE_DIR });
	// const model = new ChatMessageModel(orm);

	// await image.init();

	// server.route<{
	// 	Body: SearchQuery;
	// }>({
	// 	url: `/${api}/search`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.search(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });


	// server.route<{
	// 	Body: CreateQuery;
	// }>({
	// 	url: `/${api}/create`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.create(request.body);
	// 		reply.created(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: UpdateQuery;
	// }>({
	// 	url: `/${api}/update`,
	// 	method: 'PATCH',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.update(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: UpsertQuery;
	// }>({
	// 	url: `/${api}/upsert`,
	// 	method: 'PUT',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.upsert(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: DeleteQuery;
	// }>({
	// 	url: `/${api}/delete`,
	// 	method: 'DELETE',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.delete(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: AggregateQuery;
	// }>({
	// 	url: `/${api}/aggrerate`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.aggrerate(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: GroupQuery;
	// }>({
	// 	url: `/${api}/group`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.group(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: BatchQuery[];
	// }>({
	// 	url: `/${api}/batch`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const result = await model.batch(request.body);
	// 		reply.ok(result);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: SearchManyQuery;
	// }>({
	// 	url: `/${api}/searchMany`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.searchMany(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: CreateManyQuery;
	// }>({
	// 	url: `/${api}/createMany`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.createMany(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: UpdateManyQuery;
	// }>({
	// 	url: `/${api}/updateMany`,
	// 	method: 'PATCH',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.updateMany(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	// server.route<{
	// 	Body: DeleteManyQuery;
	// }>({
	// 	url: `/${api}/deleteMany`,
	// 	method: 'PATCH',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.deleteMany(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });
};

export default route;
