import type { FastifyPluginAsync } from 'fastify';
import type { JWTPayload, UserInfo } from '../global';

import wrapper from 'fastify-plugin';
// @ts-ignore
import {  } from 'fastmq';


declare module 'fastify' {
	interface FastifyInstance {
	}
}

interface WSSPlugin {

}
interface ListenOptions {
	host?: string;
	port?: number;
}
interface Options {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'mq';
const plugin: Plugin = async (app, opts) => {



  app.addHook('onClose', () => {})
};

declare const mq: Plugin;
export default wrapper(plugin, { name });
