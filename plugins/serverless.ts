import type { FastifyPluginAsync } from 'fastify';
import type { JWTPayload, UserInfo } from '../global';

import wrapper from 'fastify-plugin';
import fs from 'fs';
import path from 'path';

declare module 'fastify' {
  interface FastifyRequest { }
}

interface Options { }
interface Plugin extends FastifyPluginAsync<Options> { }

const name = 'serverless';
const plugin: Plugin = async (server, opts) => { };

declare const serverless: Plugin;
export default wrapper(plugin, { name });
