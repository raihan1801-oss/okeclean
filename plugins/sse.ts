import type {} from 'events';
import type {
	FastifyInstance,
	FastifyPluginAsync,
	FastifyReply,
	FastifyRequest,
} from 'fastify';
import wrapper from 'fastify-plugin';
import chalk from 'chalk';
import { EventEmitter } from 'events';

declare module 'fastify' {
	interface FastifyInstance {
		sse: SSE;
	}
	interface FastifyReply {
		createEvent(): SSEReply;
	}
}

interface Options {
	prefix?: string;
	ping?: number;
}
interface Plugin extends FastifyPluginAsync<Options> {}

class SSE {
	static connections = new Set<SSEReply>();
	public prefix = '';
	public ping = 0;
	constructor(
		private app: FastifyInstance,
		options?: { prefix?: string; ping?: number }
	) {
		this.prefix = options?.prefix ?? '';
		this.ping = options?.ping ?? 59000;
	}
	route(route: {
		path: string;
		handler: (
			this: FastifyInstance,
			request: FastifyRequest,
			reply: SSEReply
		) => void;
	}) {
		this.app.route({
			url: this.prefix + route.path,
			method: 'GET',
			handler: (request, reply) => {
				const sse_reply = new SSEReply(reply, { ping: this.ping });
				route.handler.call(this.app, request, sse_reply);
			},
		});
	}
}

class SSEReply extends EventEmitter {
	public id = 0;
	constructor(
		private reply: FastifyReply,
		public options: { ping?: number } = {}
	) {
		super();

		reply.raw.setHeader('Content-Type', 'text/event-stream');
		reply.raw.setHeader('Connection', 'keep-alive');
		reply.raw.setHeader('Cache-Control', 'no-cache');
		reply.raw.write('\n');

		SSE.connections.add(this);

		reply.log.info(
			chalk`Server Sent Event Connection {yellow ${reply.request.method}:} {white ${reply.request.url}} {blue (${SSE.connections.size})} {magenta ${reply.request.ip}}`
		);

		if (options.ping) {
			if (options.ping < 45000) {
				options.ping = 59000;
			}
			let id: any = undefined;
			id = setInterval(() => {
				this.ping('Hello');
			}, options.ping);
			this.once('close', () => {
				clearInterval(id);
			});
			this.on('ping', (data) => {
				reply.log.info(
					chalk`Server Sent Event Ping ` +
						chalk.yellow`${reply.request.method}: ` +
						chalk.white`${reply.request.url} ` +
						'{ ' +
						chalk.white`${data} ` +
						'} ' +
						chalk.blue`(${SSE.connections.size}) ` +
						chalk.magentaBright`(${reply.request.ip})`
				);
			});
		}

		reply.raw.on('error', (error) => {
			this.emit('error', error);
		});
		reply.raw.once('close', () => {
			SSE.connections.delete(this);
			reply.log.info(
				chalk`Server Sent Event Disconnection {yellow ${reply.request.method}:} {green ${reply.statusCode} -} {white ${reply.request.url}} {blue (${SSE.connections.size})} {magenta ${reply.request.ip}}`
			);
			this.emit('close');
			this.clean();
		});
	}
	public send(
		type: string | { id: number; type: string; retry?: number },
		...chunk: any[]
	) {
		if (typeof type == 'object') {
			this.reply.raw.write(serialize(type));
		} else {
			this.reply.raw.write(serialize({ type }));
		}
		if (chunk.length == 1) {
			chunk = chunk[0];
		}
		this.reply.raw.write(serialize({ data: chunk }));
		this.reply.raw.write('\n');
		return this;
	}
	public close(chunk: any) {
		this.reply.raw.end(serialize({ end: chunk }));
		return this;
	}
	public clean() {
		setTimeout(() => {
			this.reply.raw.removeAllListeners();
			this.removeAllListeners();
		});
		return this;
	}
	public ping(data: string) {
		this.send({ type: 'ping', id: this.id++ }, data);
		this.emit('ping', data);
		return this;
	}
}

const name = 'sse';
const plugin: Plugin = async (server, opts) => {
	server.decorate(name, new SSE(server, { prefix: opts.prefix }));
	server.decorateReply('createEvent', function (this: FastifyReply) {
		const reply = new SSEReply(this);
		return reply;
	});
	server.addHook('onClose', () => {
		for (const connection of SSE.connections) {
			connection.close('');
		}
		SSE.connections.clear();
	});
};

function serialize(chunk: object): string {
	let result = '';
	for (let [key, value] of Object.entries(chunk)) {
		if (typeof value == 'object') {
			value = JSON.stringify(value);
		}
		result += `${key}: ${value}\n`;
	}
	if (!result) {
		return '';
	}
	return result;
}

declare const sse: Plugin;
export default wrapper(plugin, { name });
