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

	GetParam,
	CreateParam,
	UpdateParam,
	DeleteParam,
} from 'schemas/v0-alpha.1/feature';

import fs from 'fs-extra';
import path from 'path';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import Api from 'utility/api';

import FeatureModel from 'models/feature';
import FeatureFeature from 'features/feature';
import { FileStorage } from 'utility/storage';

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: { SERVER_PUBLIC_DIR, SERVER_STATIC_PATH },
	} = process as Env<typeof EnvJson>;
	const api = 'feature';
	const { jwt, orm, rbac, totp } = server;
	const FILE_DIR = path.join(SERVER_PUBLIC_DIR, api);
	const IMAGE_DIR = FileStorage.path.join(FILE_DIR, 'image');
	const IMAGE_STATIC = FileStorage.path.join(SERVER_STATIC_PATH, api, 'image');
	const image = new FileStorage({ root: IMAGE_DIR });
	const model = new FeatureModel(orm);
	const feature = new FeatureFeature(model);

	await image.init();
	await feature.init();

	server.route<{
		Body: GetParam;
	}>({
		url: `/${api}/get`,
		method: 'POST',
		handler: async (request, reply) => {
			const payload = await feature.get(request.body);
			reply.ok(payload);
		},
		schema: {},
	});
	server.route({
		url: `/${api}/get-all`,
		method: 'GET',
		handler: async (request, reply) => {
			const payload = await feature.get_all();
			reply.ok(payload);
		},
		schema: {},
	});
	server.route<{
		Body: CreateParam;
	}>({
		url: `/${api}/create`,
		method: 'POST',
		handler: async (request, reply) => {
			const payload = await feature.create(request.body);
			reply.created(payload);
		},
		schema: {},
	});
	server.route<{
		Body: UpdateParam;
	}>({
		url: `/${api}/update`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const payload = await feature.update(request.body);
			reply.ok(payload);
		},
		schema: {},
	});
	server.route<{
		Body: DeleteParam;
	}>({
		url: `/${api}/delete`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const payload = await feature.delete(request.body);
			reply.ok(payload);
		},
		schema: {},
	});

	// server.route<{
	// 	Body: AggregateQuery;
	// }>({
	// 	url: `/${api}/aggrerate`,
	// 	method: 'POST',
	// 	handler: async (request, reply) => {
	// 		const Feature = await request.identify();
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
	// 		const Feature = await request.identify();
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
	// 		const Feature = await request.identify();
	// 		const result = await model.setInfo(Feature).batch(request.body);
	// 		model.unsetInfo();
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
	// 		const Feature = await request.identify();
	// 		const data = await model.searchMany(request.body);
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
	// 		const Feature = await request.identify();
	// 		const data = await model.setInfo(Feature).updateMany(request.body);
	// 		reply.ok(data);
	// 	},
	// 	schema: {},
	// });

	server.route<{
		Params: { '*': string };
	}>({
		url: `/${api}/image/*`,
		method: 'POST',
		handler: async (request, reply) => {
			const dirname = FileStorage.path.dirname(request.params['*']);
			const filename = FileStorage.path.basename(request.params['*']);
			const src = FileStorage.path.join(IMAGE_STATIC, request.params['*']);

			await image.saveImage(request.raw, { dirname, filename, keep: false });

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
		method: 'DELETE',
		handler: async (request, reply) => {
			try {
				const dirname = FileStorage.path.dirname(request.params['*']);
				const filename = FileStorage.path.basename(request.params['*']);
				const src = FileStorage.path.join(dirname, filename).substring(IMAGE_STATIC.length - 1);

				await image.remove_file(src);

				reply.type('text/plain');
				reply.code(200);
				reply.send(src);
				return reply;
			} catch (error: any) {
				throw Api.Error.FailedProccessingImage(error.message);
			}
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
