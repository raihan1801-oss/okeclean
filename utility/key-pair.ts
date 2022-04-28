import type { Env } from 'global';
import type EnvType from '../.env.json';

import fs from 'fs';
import path from 'path';
import Dotenv from 'dotenv';
import Rsa from 'node-rsa';
import chalk from 'chalk';
import webPush from 'web-push';

export interface Options {
	verbose?: boolean;
	loadEnv?: boolean;
}

export const defOpts: Options = {
	verbose: true,
	loadEnv: true,
};

export class KeyPair {
	public static setup(opts: Options) {
		const { verbose, loadEnv } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;

		loadEnv && Dotenv.config({ debug: true });

		const { env } = process as Env<typeof EnvType>;
		const secretKey = env.SECRET_KEY;
		const key = new Rsa().generateKeyPair();
		const publicKey = key.exportKey('pkcs1-public-pem');
		const privateKey = key.exportKey('pkcs1-private-pem');

		if (verbose) {
			console.log('%s\n%s\nSecret Key %s', publicKey, privateKey, secretKey);
		}
    
		fs.writeFileSync(path.join(env.PUBLIC_KEY_DIR, 'public.pem'), publicKey);
		fs.writeFileSync(path.join(env.PRIVATE_KEY_DIR, 'private.pem'), privateKey);

		console.log(
			chalk.bgBlack.white`Generate RSA asymmetric key`,
			chalk.green`[Success]`
		);

		return {
			public: publicKey,
			private: privateKey,
		};
	}
	public static load(opts: Options) {
		const { verbose } = Object.assign({}, defOpts, opts) as Required<Options>;
		const { env } = process as Env<typeof EnvType>;
		const rsa = new Rsa();
		const publicPath = path.join(env.PUBLIC_KEY_DIR, 'public.pem');
		const privatePath = path.join(env.PRIVATE_KEY_DIR, 'private.pem');

		let publicPem: string | Buffer = '';
		let privatePem: string | Buffer = '';

		if (!fs.existsSync(publicPath) || !fs.existsSync(privatePath)) {
			const key = this.setup({
				loadEnv: false,
				verbose,
			});

			console.log(
				chalk.bgBlack.white`Ensure RSA asymmetric key`,
				chalk.green`[Success]`
			);

			publicPem = key.public;
			privatePem = key.private;
		} else {
			publicPem = fs.readFileSync(publicPath);
			privatePem = fs.readFileSync(privatePath);
		}

		const publicKey = rsa
			.importKey(publicPem, 'pkcs1-public-pem')
			.exportKey('public');
		const privateKey = rsa
			.importKey(privatePem, 'pkcs1-private-pem')
			.exportKey('private');

		console.log(
			chalk.bgBlack.white`Load RSA asymmetric key`,
			chalk.green`[Success]`
		);

		return {
			public: publicKey,
			private: privateKey,
		};
	}
	static vapid(opts: Options) {
		const { verbose, loadEnv } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;

		loadEnv && Dotenv.config({ debug: true });

		const { env } = process as Env<typeof EnvType>;
		const { privateKey, publicKey } = webPush.generateVAPIDKeys();

		if (verbose) {
			console.log('%s\n%s', publicKey, privateKey);
		}
    
		fs.writeFileSync(path.join(env.PUBLIC_KEY_DIR, 'vapid-public.pem'), publicKey);
		fs.writeFileSync(path.join(env.PRIVATE_KEY_DIR, 'vapid-private.pem'), privateKey);

		console.log(
			chalk.bgBlack.white`Generate RSA asymmetric key`,
			chalk.green`[Success]`
		);

		return {
			public: publicKey,
			private: privateKey,
		};
	}
}
