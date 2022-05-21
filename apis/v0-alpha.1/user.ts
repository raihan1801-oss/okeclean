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

	SearchQuery,
	UpdateQuery,
	SearchManyQuery,

	LoginData,
	RegisterData,
	UnregisterData,
	ChangePasswordData,
	GenerateOTP,
	VerifyOTP,
	Subscribe,
	Unsubscribe,
	GetParam,
} from 'schemas/v0-alpha.1/user';

import fs from 'fs-extra';
import path from 'path';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import Api from 'utility/api';

import UserModel from 'models/user';
import UserFeature from 'features/user';
import { FileStorage } from 'utility/storage';

const route: FastifyPluginAsync = async (server, opts) => {
	const {
		env: { SERVER_PUBLIC_DIR, SERVER_STATIC_PATH, PROD },
	} = process as Env<typeof EnvJson>;
	const api = 'user';
	const { jwt, orm, rbac, totp, mail } = server;
	const FILE_DIR = path.join(SERVER_PUBLIC_DIR, api);
	const IMAGE_DIR = FileStorage.path.join(FILE_DIR, 'image');
	const IMAGE_STATIC = FileStorage.path.join(SERVER_STATIC_PATH, api, 'image');
	const image = new FileStorage({ root: IMAGE_DIR });
	const model = new UserModel(orm);
	const feature = new UserFeature(model);

	await image.init();
	await feature.init();

	server.route<{
		Body: RegisterData;
	}>({
		url: `/${api}/register`,
		method: 'POST',
		handler: async (request, reply) => {
			const data = await feature.register(request.body)
			const token = await jwt.sign<JWTPayload>({
				sub: data.id,
				role: data.role,
			});
			if (data.role == 'customer' && PROD) {
				const code = totp.generate(request.body.email);
				reply.log.info("OTP Code: " + code);
				await mail.send({
					from: `no-reply@` + request.headers.host,
					to: data.email,
					subject: 'Your OTP Code',
					priority: 'high',
					html: otp_template(code),
				});
			}
			reply.header('authorization', `Bearer ${token}`);
			reply.created<Data>(data);
			server.event.emit(`model:${api}:change`, data);
		},
		schema: {},
	});

	server.route<{
		Body: UnregisterData;
	}>({
		url: `/${api}/unregister`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const data = await feature.unregister(request.body);
			reply.ok<Data>(data)
		},
		schema: {},
	});

	server.route<{
		Body: LoginData;
	}>({
		url: `/${api}/login`,
		method: 'POST',
		handler: async (request, reply) => {
			const data = await feature.login(request.body);
			const token = await jwt.sign<JWTPayload>({
				sub: data.id,
				role: data.role,
			});
			reply.header('authorization', `Bearer ${token}`);
			reply.ok<Data>(data);
		},
		schema: {},
	});

	server.route<{ Body: ChangePasswordData }>({
		url: `/${api}/change-password`,
		method: 'PATCH',
		handler: async (request, reply) => {
			const data = await feature.change_password(request.body)
			reply.ok<Data>(data);
		},
		schema: {},
	});

	server.route({
		url: `/${api}/auth`,
		method: 'GET',
		handler: async (request, reply) => {
			const user = await request.identify();
			const data = await model.get({ where: { id: user.sub } });

			if (data) {
				if (data.role == user.role) {
					reply.ok<Data>(data);
				} else {
					throw Api.Error.FailedAuthentication('Invalid Role');
				}
			} else {
				throw Api.Error.FailedAuthentication('Unknown User');
			}
		},
		schema: {},
	});

	server.route<{ Body: GenerateOTP }>({
		url: `/${api}/generate-otp`,
		method: 'POST',
		handler: async (request, reply) => {
			const user = await feature.generate_otp(request.body);
			const code = totp.generate(request.body.email);
			reply.log.info("OTP Code: " + code);
			await mail.send({
				from: `no-reply@` + request.headers.host,
				to: user.email,
				subject: 'Your OTP Code',
				priority: 'high',
				html: otp_template(code),
			});
			reply.ok(user);
		},
		schema: {},
	});

	server.route<{ Body: VerifyOTP }>({
		url: `/${api}/verify-otp`,
		method: 'POST',
		handler: async (request, reply) => {
			const pass = totp.verify(request.body.code, request.body.email);
			console.log("[otp] pass", pass);
			if (pass) {
				const user = await feature.verify_otp(request.body);
				reply.ok(user);
			}
			throw Api.Error.FailedVerifyOtp('Invalid OTP Code');
		},
		schema: {},
	});

	server.route<{
		Body: GetParam;
	}>({
		url: `/${api}/search`,
		method: 'POST',
		handler: async (request, reply) => {
			// const user = await request.identify("admin");
			const data = await feature.get(request.body);
			reply.ok(data);
		},
		schema: {},
	});

	server.route({
		url: `/${api}/search-many`,
		method: 'GET',
		handler: async (request, reply) => {
			// const user = await request.identify("admin");
			const data = await feature.get_all();
			reply.ok(data);
		},
		schema: {},
	});

	server.route<{
		Body: UpdateQuery;
	}>({
		url: `/${api}/update`,
		method: 'PATCH',
		handler: async (request, reply) => {
			// const user = await request.identify();
			delete request.body.data.password;

			const data = await model.update(request.body);
			if (data.chat_node_id) {
				await orm.chatNode.update({where: {id: data.chat_node_id}, data: {
					name: data.name,
					image: data.image,
				}})
			}
			reply.ok(data);
			// const data = await model.get({ where: { id: user.sub } });

			// if (data) {
			// 	if (data.role == user.role) {
			// 		const data = await model.update(request.body);
			// 		reply.ok(data);
			// 		server.event.emit(`model:${api}:change`, data);
			// 	} else {
			// 		throw Api.Error.FailedAuthentication('Invalid Role');
			// 	}
			// } else {
			// 	throw Api.Error.FailedAuthentication('Unknown User');
			// }
		},
		schema: {},
	});

	server.route<{
		Body: GetParam;
	}>({
		url: `/${api}/delete`,
		method: 'DELETE',
		handler: async (request, reply) => {
			const user = await request.identify("admin");
			const data = await model.delete({ where: { id: request.body.id } });
			reply.ok(data);
		},
		schema: {},
	});

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
	// 		const result = await model.setInfo(user).batch(request.body);
	// 		model.unsetInfo();
	// 		reply.ok(result);
	// 	},
	// 	schema: {},
	// });

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

	// server.route<{
	// 	Body: UpdateManyQuery;
	// }>({
	// 	url: `/${api}/updateMany`,
	// 	method: 'PATCH',
	// 	handler: async (request, reply) => {
	// 		const user = await request.identify();
	// 		const data = await model.setInfo(user).updateMany(request.body);
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
			// const user = await request.identify();
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

function otp_template(code: string) {
	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="author" content="bladerlaiga" />
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
				<meta name="theme-color" content="#42A5F5" />
				<title>Your Code OTP</title>
			</head>
			<body style="max-width: 100vw; min-height: 100vh; padding: 32px; display: grid; align-content: start; gap: 4px;">
				<h1 style="padding: 0;">Dear Registerant</h1>
				<h2 style="padding: 0;">Thank you for registering with Oke Clean</h2>
				<p style="font-size: 16px;">To continue, please verify your E-mail address.</p>
				<p style="font-size: 16px;">Attention, do not give OTP code to anyone, your OTP code: <strong>${code}</strong>, is valid for up to 60 seconds from the start of your registration and do not refresh or close your verification page.</p>
				<h3 style="padding: 0;">Warm Regards</h3>
				<h3 style="padding: 0;"><em>Oke Clean</em></h3>
			</body>
		</html>
	`;
}

export default route;
