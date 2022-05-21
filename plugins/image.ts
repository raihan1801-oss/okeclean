import type { FastifyPluginAsync } from 'fastify';
import wrapper from 'fastify-plugin';
import sharp from 'sharp';

declare module 'fastify' {
	interface FastifyInstance {}
}

interface Options {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'image';
const plugin: Plugin = async (server, opts) => {
	server.addContentTypeParser(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], async function (request, payload, done) {
		return null;
	});
};

declare const image: Plugin;
export default wrapper(plugin, { name });
