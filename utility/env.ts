import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import path from 'path';
// @ts-ignore
import parser from 'dotenv-stringify';
import chalk from 'chalk';

export interface Options {
	production?: boolean;
	global?: boolean;
	cwd?: string;
	arch?: 'serverfull' | 'serverless';
	verbose?: boolean;
	initEnv?: object;
}
export const defOpts: Options = {
	arch: 'serverfull',
	global: false,
	production: false,
	cwd: process.cwd(),
	verbose: false,
	initEnv: {},
};

export class EnvConfig {
	public static setup(opts: Options) {
		const { arch, cwd, production, verbose, global } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;
		const { env: nodeEnv } = process;
		const PROTOCOL = 'http';
		const WS_PROTOCOL = 'ws';
		const HOSTNAME = production ? nodeEnv.HOSTNAME ?? '0.0.0.0' : 'localhost';
		const PORT = global ? nodeEnv.PORT ?? 0 : 5000;
		const WS_PORT = global ? nodeEnv.PORT ?? 0 : 5050;
		const PROJECT_ROOT_DIR = global ? nodeEnv.HOME ?? '' : cwd;
		// const CLIENT_ROOT_DIR = path.join(PROJECT_ROOT_DIR, 'views/client');
		// const ADMIN_ROOT_DIR = path.join(PROJECT_ROOT_DIR, 'views/admin');
		const MY_APP_ROOT_DIR = path.join(PROJECT_ROOT_DIR, 'views/my-app');
		const BASE_API_PATH = '/api';
		const appEnv = {
			DEV: production != true,
			PROD: production,
			NODE_ENV: production ? 'production' : 'development',

			SERVER_ENV: production ? 'production' : 'development',
			SERVER_CONTEXT: global ? 'global' : 'local',
			SERVER_ARCH: arch,
			SERVER_DOMAIN: '',
			SERVER_URL: 'http://localhost',

			SERVER_PROTOCOL: PROTOCOL,
			SERVER_HOSTNAME: HOSTNAME,
			SERVER_PORT: PORT,
			SERVER_HOST: `${HOSTNAME}:${PORT}`,
			SERVER_ORIGIN: `${PROTOCOL}://${HOSTNAME}:${PORT}`,
			SERVER_ALLOWED_ORIGINS: '',

			WS_SERVER_PROTOCOL: WS_PROTOCOL,
			WS_SERVER_PORT: WS_PORT,
			WS_SERVER_HOSTNAME: HOSTNAME,
			WS_SERVER_ORIGIN: `${WS_PROTOCOL}://${HOSTNAME}:${WS_PORT}`,

			API_SERVER_BASE_PATH: BASE_API_PATH,
			EVENT_SERVER_BASE_PATH: '/event',
			WS_SERVER_BASE_PATH: '/ws',

			CLIENT_FETCH_MODE: 'same-origin',

			SERVER_STATIC_PATH: '/resource',
			SERVER_LOGS_DIR: path.join(PROJECT_ROOT_DIR, 'logs'),
			SERVER_PUBLIC_DIR: path.join(PROJECT_ROOT_DIR, 'public'),
			SERVER_PRIVATE_DIR: path.join(PROJECT_ROOT_DIR, 'private'),
			SERVER_BUILD_DIR: path.join(PROJECT_ROOT_DIR, 'build'),
			MY_APP_BUILD_DIR: path.join(MY_APP_ROOT_DIR, 'build'),
			// CLIENT_BUILD_DIR: path.join(CLIENT_ROOT_DIR, 'build'),
			// ADMIN_BUILD_DIR: path.join(ADMIN_ROOT_DIR, 'build'),
			PROJECT_ROOT_DIR,
			// CLIENT_ROOT_DIR,
			// ADMIN_ROOT_DIR,
			MY_APP_ROOT_DIR,

			PUBLIC_KEY_DIR: PROJECT_ROOT_DIR,
			PRIVATE_KEY_DIR: PROJECT_ROOT_DIR,
			VAPID_PUBLIC_KEY_DIR: PROJECT_ROOT_DIR,
			VAPID_PRIVATE_KEY_DIR: PROJECT_ROOT_DIR,

			LANDING_URL: '/',
			MODEL_URL: '/',
			ADMIN_URL: '/',
			DATABASE_URL:
				'postgresql://okeclean:1234@localhost:5432/okeclean',
			EMAIL_URL:
				'smtps://bladerlaiga.97@gmail.com:mzzszpmsclaaxihc@smtp.googlemail.com:465',

			SECRET_KEY:
				'tu6rWzYGZpgFTahK27P63XIYHKFtYMg627JbESd4qZtboAYjYu0t9UNkTxUUyg3LVlqDj5yCwdfI9SGtCEgiN++s0zExs5CVB98Xf2GVaOSq+B2EgNF0F1PrzdxghfKJR/g5la6Ulh37q7vFMLlnUJJOryHJjANsoZFZmw7vyQgpcNFwmL+IyK14KjYq3pOkxZynZ95ybBKNnzqCzOu+bzNmARa5VQ8MrxYug7aODQt1MwwCWoyy9WkuJ/yFH/dK5YVK8wUxsztZ1+zyjNTEeYCRia2BmyupfsMWieEWtD9szvG4jATsSvAP94btv3OLRJbHIZc5HWzqYYp+qUFU4g==',
			EMAIL_KEY: '',
			PAYMENT_KEY: '',
			MAP_KEY:
				'pk.eyJ1IjoiYW5hc211YmFyYWt5YXNpbiIsImEiOiJja3Nsd3Z0cWYzMWw1Mm5uNXZubmJ1Ymw3In0.jyHU9ikVYEI2Xgv9FVNDVA',
		};
		const clientEnv = {
			VITE_SERVER_ENV: appEnv.SERVER_ENV,
			VITE_SEVER_CONTEXT: appEnv.SERVER_CONTEXT,
			VITE_SERVER_ORIGIN: appEnv.SERVER_ORIGIN,
			VITE_SERVER_DOMAIN: appEnv.SERVER_DOMAIN,
			VITE_SERVER_URL: appEnv.SERVER_URL,
			VITE_API_SERVER_BASE_PATH: appEnv.API_SERVER_BASE_PATH,
			VITE_EVENT_SERVER_BASE_PATH: appEnv.EVENT_SERVER_BASE_PATH,
			VITE_WS_SERVER_BASE_PATH: appEnv.WS_SERVER_BASE_PATH,
			VITE_SERVER_STATIC_PATH: appEnv.SERVER_STATIC_PATH,
			VITE_CLIENT_FETCH_MODE: appEnv.CLIENT_FETCH_MODE,
			// VITE_CLIENT_BUILD_DIR: appEnv.CLIENT_BUILD_DIR,
			VITE_LANDING_URL: appEnv.LANDING_URL,
			VITE_MAP_KEY: appEnv.MAP_KEY,
			VITE_EMAIL_KEY: appEnv.EMAIL_KEY,
			VITE_PAYMENT_KEY: appEnv.PAYMENT_KEY,
		};
		fs.writeFileSync(path.resolve(cwd, '.env'), parser(appEnv));
		fs.writeFileSync(
			path.resolve(cwd, '.env.json'),
			JSON.stringify(appEnv, undefined, '\t')
		);
		// fs.writeFileSync(
		// 	path.resolve(cwd, 'views/client', '.env'),
		// 	parser(clientEnv)
		// );
		// fs.writeFileSync(
		// 	path.resolve(cwd, 'views/admin', '.env'),
		// 	parser(clientEnv)
		// );
		fs.writeFileSync(
			path.resolve(cwd, 'views/my-app', '.env'),
			parser(clientEnv)
		);
		if (verbose) {
			console.log(nodeEnv);
			console.log(appEnv);
			console.log(clientEnv);
		}
		console.log(
			chalk.bgBlack.white`Build ${appEnv.SERVER_ENV} environment`,
			chalk.green`[Success]`
		);
	}
	public static ensure(opts: Options) {
		const { global, production, cwd, verbose, initEnv } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;
		const { env: nodeEnv } = process;
		const PROTOCOL = 'http';
		const HOSTNAME = production ? '0.0.0.0' : 'localhost';
		const PORT = global ? nodeEnv.PORT ?? 0 : 5000;
		const PROJECT_ROOT_DIR = global ? nodeEnv.HOME ?? '' : cwd;
		const CLIENT_ROOT_DIR = path.join(PROJECT_ROOT_DIR, 'views/client');
		const appEnv = {
			SERVER_PROTOCOL: PROTOCOL,
			SERVER_HOSTNAME: HOSTNAME,
			SERVER_PORT: PORT,
			SERVER_HOST: `${HOSTNAME}:${PORT}`,
			SERVER_ORIGIN: `${PROTOCOL}://${HOSTNAME}:${PORT}`,

			SERVER_PUBLIC_DIR: path.join(PROJECT_ROOT_DIR, 'public'),
			SERVER_PRIVATE_DIR: path.join(PROJECT_ROOT_DIR, 'private'),
			SERVER_BUILD_DIR: path.join(PROJECT_ROOT_DIR, 'build'),
			PROJECT_ROOT_DIR,
			CLIENT_ROOT_DIR,

			PUBLIC_KEY_DIR: PROJECT_ROOT_DIR,
			PRIVATE_KEY_DIR: PROJECT_ROOT_DIR,
		};
		const newEnv = Object.assign({}, initEnv, appEnv);
		fs.writeFileSync(path.resolve(cwd, '.env'), parser(newEnv));
		fs.writeFileSync(
			path.resolve(cwd, '.env.json'),
			JSON.stringify(newEnv, undefined, '\t')
		);
		if (verbose) {
			console.log(nodeEnv);
			console.log(newEnv);
			console.log(initEnv);
		}
		console.log(
			chalk.bgBlack.white`Ensure environment`,
			chalk.green`[Success]`
		);
	}
	static set(data: object, opts?: Options) {
		const { cwd, verbose } = Object.assign(
			{},
			defOpts,
			opts
		) as Required<Options>;
		const appEnv = fs.readJSONSync(path.resolve(cwd, '.env.json'));
		for (const [key, value] of Object.entries(data)) {
			const oldValue = appEnv[key];
			appEnv[key] = value;
			console.log(
				chalk.bgBlack.white`Set environment`,
				oldValue ? chalk.yellow`[=]` : chalk.green`[+]`,
				chalk.white`${key}`,
				chalk.bgBlack.white`=`,
				chalk.blue`${value}`
			);
		}
		const clientEnv = {
			VITE_SERVER_ENV: appEnv.SERVER_ENV,
			VITE_SEVER_CONTEXT: appEnv.SERVER_CONTEXT,
			VITE_SERVER_ORIGIN: appEnv.SERVER_ORIGIN,
			VITE_SERVER_DOMAIN: appEnv.SERVER_DOMAIN,
			VITE_SERVER_URL: appEnv.SERVER_URL,
			VITE_API_SERVER_BASE_PATH: appEnv.API_SERVER_BASE_PATH,
			VITE_EVENT_SERVER_BASE_PATH: appEnv.EVENT_SERVER_BASE_PATH,
			VITE_WS_SERVER_BASE_PATH: appEnv.WS_SERVER_BASE_PATH,
			VITE_SERVER_STATIC_PATH: appEnv.SERVER_STATIC_PATH,
			VITE_CLIENT_FETCH_MODE: appEnv.CLIENT_FETCH_MODE,
			VITE_CLIENT_BUILD_DIR: appEnv.CLIENT_BUILD_DIR,
			VITE_LANDING_URL: appEnv.LANDING_URL,
			VITE_MAP_KEY: appEnv.MAP_KEY,
			VITE_EMAIL_KEY: appEnv.EMAIL_KEY,
			VITE_PAYMENT_KEY: appEnv.PAYMENT_KEY,
		};
		fs.writeFileSync(path.resolve(cwd, '.env'), parser(appEnv));
		fs.writeJSONSync(path.resolve(cwd, '.env.json'), appEnv, { spaces: '\t' });
		fs.writeFileSync(
			path.resolve(cwd, 'views/client', '.env'),
			parser(clientEnv)
		);
		fs.writeFileSync(
			path.resolve(cwd, 'views/admin', '.env'),
			parser(clientEnv)
		);
		console.log(chalk.bgBlack.white`Set environment`, chalk.green`[Success]`);
	}
}
