import type {FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
// @ts-ignore
import RBAC from 'fast-rbac';
import type RBACType from 'fast-rbac/dist/browser/index';

declare module 'fastify' {
	interface FastifyInstance {
		rbac: RBACType;
	}
}

interface Options extends RBACType.Options {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'rbac';
const plugin: Plugin =
	async function fastifyMetrics(server, opt) {
		const rbac = new RBAC(opt);
		server.decorate(name, rbac);
		return;
	};

declare const rbac: Plugin;
export = fastifyPlugin(plugin, {
	fastify: '>=1.0.0',
	name,
});
