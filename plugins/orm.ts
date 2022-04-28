import type {FastifyPluginAsync} from 'fastify';
import wrapper from 'fastify-plugin';
import {PrismaClient} from '@prisma/client';

declare module 'fastify' {
	interface FastifyInstance {
		orm: PrismaClient;
	}
}

interface Options {
	delete?: boolean;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'orm';
const plugin: Plugin = async (server, opts) => {
	const orm = new PrismaClient({errorFormat: 'pretty'});

	await orm.$connect();

	server.decorate(name, orm);
	server.addHook('onClose', async () => {
		await orm.$disconnect();
	});
};

declare const orm: Plugin;
export default wrapper(plugin, {name});
