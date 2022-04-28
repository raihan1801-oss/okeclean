import type { FastifyPluginAsync } from 'fastify';
import type { JWTPayload, UserInfo } from '../global';

import wrapper from 'fastify-plugin';
import { EventEmitter } from 'events';

declare module 'fastify' {
	interface FastifyInstance {
    event: EventEmitter;
	}
}

class Event {}

interface ListenOptions {}
interface Options {}
interface Plugin extends FastifyPluginAsync<Options> {}

const name = 'event';
const plugin: Plugin = async (app, opts) => {
  const event = new EventEmitter();

  app.decorate(name, event);

  app.addHook('onClose', () => {})
};

declare const event: Plugin;
export default wrapper(plugin, { name });

