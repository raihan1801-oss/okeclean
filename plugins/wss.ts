import type { FastifyPluginAsync, FastifyInstance } from 'fastify';
import type { JWTPayload, UserInfo } from '../global';

import wrapper from 'fastify-plugin';
import {
	WSS,
	Handler,
	Route,
	ChannelStore,
	Channel,
	Address,
} from 'utility/wss';
import { Server } from 'http';

declare module 'fastify' {
	interface FastifyInstance {
		wss: WSSPlugin;
	}
}

interface WSSPlugin {
	route(route: Route): this;
	printRoute(options: any): string;
	listen(options?: ListenOptions): this;
	createChannel(key: string): Channel;
	createAddress(): Address;
	getChannels(): ChannelStore;
}
interface ListenOptions {
	host?: string;
	port?: number;
	server?: Server;
}
interface Options {
	prefix?: string;
	ping?: number;
}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'wss';
const plugin: Plugin = async (app, opts) => {
	WSS.prefix = opts.prefix ?? '';

	const wss: WSSPlugin = {
		route(route: Route) {
			WSS.route(route);
			return this;
		},
		printRoute(opts) {
			return WSS.routes.prettyPrint(opts);
		},
		listen(options?: ListenOptions) {
			WSS.setup({
				...options,
				ping: opts.ping,
				app,
			});
			return this;
		},
		createChannel(key: string) {
			return WSS.channels.create({
				key,
			});
		},
		createAddress() {
			return WSS.createAddress();
		},
		getChannels() {
			return WSS.getChannels();
		},
	};

	app.decorate(name, wss);
	app.addHook('onClose', () => {
		WSS.server?.close();
	});
};

declare const wss: Plugin;
export default wrapper(plugin, { name });
