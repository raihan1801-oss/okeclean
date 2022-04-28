import { Server } from 'http';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { RadixTree, SearchType } from 'xradix';
import { PathnameStore, PathnameStoreOptions } from '@lunjs/pathname-store';
import chalk from 'chalk';
import { IncomingMessage } from 'http';
import { FastifyInstance } from 'fastify';

export interface Options {
	app: FastifyInstance;
	host?: string;
	port?: number;
	ping?: number;
	server?: Server;
}
export interface Handler {
	(ws: WebSocket & Addtional, store: ChannelStore): void | Promise<void>;
}
export interface HandlerAuth {
	(ws: WebSocket & Addtional, request: IncomingMessage): void | Promise<void>;
}
export interface Route {
	path: string;
	auth?: HandlerAuth;
	handler: Handler;
}
interface Router {
	path: string;
	auth?: HandlerAuth[];
	handler: Handler[];
}
interface Lookup {
	ws: WebSocket;
	message: IncomingMessage;
}
interface ChannelData {
	key: string;
}
interface BroadcastDataDirect {
	key?: string;
	data: any;
	isBinary?: boolean;
}
interface BroadcastData {
	data: any;
	isBinary?: boolean;
	exclude?: WebSocket;
}
interface Addtional {
	path: Record<string, string>;
}

const def_opts: Options = {
	app: {} as any,
	host: '127.0.0.1',
	port: 80,
};

class ChannelStore {
	private store = new RadixTree();
	create(data: ChannelData) {
		const channel = new Channel(data);
		this.store.set(data.key, channel);
		return channel;
	}
	createIfNotExist(data: ChannelData) {
		try {
			const result = this.search(data.key);
			if (!result) {
				return this.create(data);
			}
			return result;
		} catch (error: any) {
			throw error;
		}
	}
	addClientToChannel(key: string, client: WebSocket, meta: any) {
		const result = this.search(key);
		if (result) {
			result.addClient(client, meta);
			return true;
		} else {
			this.create({ key }).addClient(client, meta);
			return true;
		}
	}
	delClientFromChannel(key: string, client: WebSocket) {
		const result = this.search(key);
		if (result) {
			result.delClient(client);
			return true;
		} else {
			return false;
		}
	}
	search(key: string) {
		const result = this.store.get(key);
		if (result) {
			if (result.hasValue) {
				return result.value as Channel;
			} else {
				throw new ReferenceError('Channel already clean up');
			}
		} else {
			return null;
		}
	}
	searchAll(prefix = '') {
		return this.store.getAll(prefix, { allNodes: true });
	}
	broadcast({ key, data, isBinary }: BroadcastDataDirect) {
		if (key) {
			const channel = this.search(key);
			if (channel) {
				channel.broadcast({ data, isBinary });
			}
			return channel;
		} else {
			for (const store of this.searchAll()) {
				if (store.hasValue) {
					(store.value as Channel).broadcast({ data, isBinary });
				}
			}
		}
		return null;
	}
}
class Address {
	private store = new RadixTree();
	set(address: string, client: WebSocket) {
		this.store.set(address, client);
		client.once('close', () => {
			this.del(address);
		});
		return this;
	}
	del(address: string) {
		this.store.delete(address);
		return this;
	}
	broadcast({
		address,
		data,
		isBinary,
	}: {
		address: string;
		data: any;
		isBinary?: boolean;
	}) {
		const ws = this.search(address);
		if (ws) {
			ws.send(data, { binary: isBinary });
			return true;
		}
		return false;
	}
	search(key: string) {
		const result = this.store.get(key);
		if (result) {
			if (result.hasValue) {
				return result.value as WebSocket;
			} else {
				throw new ReferenceError('Web Socket already clean up');
			}
		} else {
			return null;
		}
	}
}
class Channel {
	key: string;
	clients = new Set<WebSocket>();
	meta = new Map<WebSocket, any>();
	constructor(opts: ChannelData) {
		this.key = opts.key;
	}
	addClient(client: WebSocket, meta: any) {
		this.clients.add(client);
		this.meta.set(client, meta);
		client.once('close', () => {
			this.delClient(client);
		});
		return this;
	}
	delClient(client: WebSocket) {
		this.clients.delete(client);
		this.meta.delete(client);
		return this;
	}
	broadcast({ data: message, isBinary, exclude }: BroadcastData) {
		if (exclude) {
			this.clients.forEach((client) => {
				if (!Object.is(exclude, client)) {
					client.send(message, { binary: isBinary });
				}
			});
		} else {
			this.clients.forEach((client) => {
				client.send(message, { binary: isBinary });
			});
		}
		return this;
	}
}

export type { ChannelStore, Channel, Address };

export class WSS {
	static prefix = '';
	static server: WebSocketServer | undefined;
	static routes = new PathnameStore();
	static channels = new ChannelStore();
	static setup(options: Options) {
		const app = options.app;

		this.server = new WebSocketServer({
			host: options.host,
			port: options.port,
			server: options.server,
		});

		console.log(chalk`Web Socket Server Created`, chalk.green`[*]`);

		this.server.on('listening', () => {
			const address = this.server?.address() as {
				address: string;
				family: string;
				port: number;
			};
			if (!address) {
				throw new Error('WSS address undefined');
			}
			app.log.info(
				chalk`Web Socket Server Listening on ` +
					chalk.blueBright`ws://${address.address}:${address.port}`
			);
		});
		this.server.on('connection', (ws, message) => {
			app.log.info(
				chalk`Web Socket Server Connection ` +
					chalk.yellow`${message.method}: ` +
					chalk.white`${message.url} ` +
					chalk.blue`(${this.server?.clients.size}) ` +
					chalk.magentaBright`(${message.socket.remoteAddress})`
			);

			if (options.ping) {
				if (options.ping < 45000) {
					options.ping = 59000;
				}
				let id: any = undefined;
				id = setInterval(() => {
					ws.ping('Hello');
				}, options.ping);
				ws.once('close', () => {
					clearInterval(id);
				})
			}

			ws.on('ping', (data) => {
				app.log.info(
					chalk`Web Socket Ping ` +
						chalk.yellow`${message.method}: ` +
						chalk.white`${message.url} ` +
						'{ ' +
						chalk.white`${data} ` +
						'} ' +
						chalk.blue`(${this.server?.clients.size}) ` +
						chalk.magentaBright`(${message.socket.remoteAddress})`
				);
			});

			ws.on('pong', (data) => {
				app.log.info(
					chalk`Web Socket Pong ` +
						chalk.yellow`${message.method}: ` +
						chalk.white`${message.url} ` +
						'{ ' +
						chalk.white`${data} ` +
						'} ' +
						chalk.blue`(${this.server?.clients.size}) ` +
						chalk.magentaBright`(${message.socket.remoteAddress})`
				);
			});

			ws.on('close', (code, reason) => {
				app.log.info(
					chalk`Web Socket Close ` +
						chalk.yellow`${message.method}: ` +
						chalk.green`${code} - ` +
						chalk.yellow`${reason} ` +
						chalk.white`${message.url} ` +
						chalk.blue`(${this.server?.clients.size}) ` +
						chalk.magentaBright`(${message.socket.remoteAddress})`
				);
			});

			this.lookup({ ws, message });
		});
		this.server.on('close', () => {
			app.log.info(chalk`Web Socket Server Close`);
		});
	}
	static route({ path, auth, handler }: Route) {
		path = this.prefix + path;

		const store = this.routes.find(path);
		const route = {
			path,
			auth,
			handler,
		};
		if (store.found) {
			const routeItem: Route[] = store.box.store;
			routeItem.push(route);
		} else {
			this.routes.add(path, [route]);
		}
		return this;
	}
	static lookup({ ws, message }: Lookup) {
		const pathStore = this.routes.find(message.url ?? '');

		if (pathStore.found) {
			const routeItem: Route[] = pathStore.box.store;
			const path: any = {};

			for (let index = 0; index < pathStore.box.pnames.length; index++) {
				const key = pathStore.box.pnames[index];
				path[key] = pathStore.pvalues[index];
			}

			Object.defineProperty(ws, 'path', { value: path });

			for (const route of routeItem) {
				let result = route.auth?.(ws as any, message);
				if (result instanceof Promise) {
					result.then(() => {
						route.handler(ws as any, this.channels);
					});
				} else {
					route.handler(ws as any, this.channels);
				}
			}
		} else {
			ws.close(1013, 'Not Found');
		}
		return this;
	}
	static createAddress() {
		return new Address();
	}
	static getChannels() {
		return this.channels;
	}
}
