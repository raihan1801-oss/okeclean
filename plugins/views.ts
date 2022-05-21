import type { FastifyPluginAsync } from 'fastify';
import type { JWTPayload, UserInfo } from '../global';

import wrapper from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import url from 'url';
import glob from 'fast-glob';

interface Options {
	prefix?: string;
	root: string;
	attachRoute?: boolean;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'views';
const def_opts: Required<Options> = {
	root: '/',
	prefix: '/',
	attachRoute: true,
};
const plugin: Plugin = async (server, opts) => {
	const options = Object.assign({}, def_opts, opts);

	const dirs = await glob('**', {
		ignore: ['node_modules', '**/node_modules/**'],
		cwd: options.root,
	});

	// for (const dir of dirs) {
	// 	if (dir.endsWith('.html')) {
	// 		const pathname = options.prefix + path.dirname(dir);
	// 		const pathname_fix =
	// 			(pathname.endsWith('/.') ? pathname.slice(0, -2) : pathname) || '/';
	// 		const dir_res = path.dirname(path.join(options.root, dir));

	// 		server.get(pathname_fix, (request, reply) => {
	// 			reply.sendFile('index.html', dir_res);
	// 		});
	// 	}
	// }
};

declare const views: Plugin;
export default wrapper(plugin, { name });
