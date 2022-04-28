import type { FastifyPluginAsync } from 'fastify';
import wrapper from 'fastify-plugin';
import { totp as totpLib, authenticator } from 'otplib';
import { createDigest } from '@otplib/plugin-crypto';
import { HashAlgorithms } from 'otplib/core';

declare module 'fastify' {
	interface FastifyInstance {
		totp: {
			generate(secret: string): string;
			verify(token: string, secret: string): boolean;
		};
	}
}

interface Options {
	pass: string;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'totp';
const plugin: Plugin = async (server, opts) => {
	const otp = totpLib.create({
		algorithm: HashAlgorithms.SHA256,
		createDigest,
		digits: 6,
		window: 5,
		step: 1000,
	});

	server.decorate(name, {
		generate(pass: string) {
			return otp.create({...otp.options}).generate(pass);
		},
		verify(token: string, pass: string) {
			return otp.verify({ token, secret: pass });
		},
	});
};

declare const totp: Plugin;
export default wrapper(plugin, { name });
