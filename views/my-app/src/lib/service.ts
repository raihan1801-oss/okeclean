/// <reference no-default-lib="true"/>
/// <reference lib="WebWorker" />

import Client, { LocalStorage } from '$lib/client';
import Api from '$lib/client-api';
import { ES_URL, WS_URL, FETCH_MODE } from '$lib/env';

type GlobalThis = typeof globalThis;
type ServiceWorkerContext = ServiceWorkerGlobalScope &
	GlobalThis &
	GlobalDefined;
type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | '*';

interface GlobalDefined {
	RequestUtil: RequestUtil;
	CacheUtil: CacheUtil;
	Api: Api;
}

interface Route {
	url: string | RegExp;
	method: Method | Method[];
	handler(request: Request, util: RouteUtil): Promise<Task>;
}
interface PluginRegister {
	(instance: Service, context: ServiceWorkerContext): Promise<void> | void;
}
interface RouteUtil {
	send(): this;
	notFound(): this;
	error(): this;
	redirect(): this;
}
interface Task extends RequestUtilOptions, CachetUtilOptions { }
interface Options {
	debug: boolean;
	cachename: string;
	resources: string[];
	enable_download?: boolean;
	enable_clean?: boolean;
	enable_proxy?: boolean;
}
type SyncEvent = ExtendableEvent & { tag: string };
type PeriodicSyncEvent = ExtendableEvent & { tag: string };
const default_options: Options = {
	debug: true,
	cachename: 'v1',
	resources: ['/'],
	enable_clean: true,
	enable_download: true,
	enable_proxy: true,
};
const default_route: Route = {
	url: /.*/,
	method: '*',
	handler: async (request, util) => ({ strategy: 'net-only' }),
};
const context: ServiceWorkerContext = self as any;
const local = new LocalStorage({ debug: false });
const api = new Api({
	base: '/',
	esbase: ES_URL,
	wsbase: WS_URL,
	version: '',
	mode: FETCH_MODE,
	debug: false,
});

export default class Service {
	public options: Options;
	public channel = new BroadcastChannel('main_channel');
	public client = new Client();
	public local = local;
	public api = api;
	public wait = wait;
	public promiseify = promiseify;
	protected table_route_static = new Map<string, Route>();
	protected table_route_dynamic = new Map<RegExp, Route>();
	protected message_handlers = new Set<Function>();

	constructor(options: Options) {
		this.options = Object.seal(Object.assign({}, default_options, options));
		this.client.init({ debug: this.options.debug });
		this.local.init({ debug: this.options.debug });
		this.api.options.debug = this.options.debug;
	}
	public async start() {
		this.options.enable_download &&
			context.addEventListener('install', (event) => {
				event.waitUntil(this.download());
			});
		this.options.enable_clean &&
			context.addEventListener('activate', (event) => {
				event.waitUntil(this.clean());
			});
		this.options.enable_proxy &&
			context.addEventListener('fetch', (event) => {
				const result = this.proxying(event.request);
				event.respondWith(result);
				event.waitUntil(result);
			});
		context.addEventListener('push', (event) => {
			this.options.debug && console.log(event);
		});
		context.addEventListener('sync' as any, (event: ExtendableEvent) => {
			this.options.debug && console.log(event);
		});
		context.addEventListener(
			'periodicsync' as any,
			(event: ExtendableEvent) => {
				this.options.debug && console.log(event);
			}
		);
		context.addEventListener('message', (event) => {
			this.options.debug && console.log(event);
		});
		context.addEventListener('error', (event) => {
			this.options.debug && console.log(event);
		});
		context.addEventListener('unhandledrejection', (event) => {
			this.options.debug && console.log(event);
		});
		this.channel.addEventListener('message', (event) => {
			this.options.debug && console.log(event);
			for (const handler of this.message_handlers) {
				handler(event.data);
			}
		});
	}
	public onPeriodicSync(handler: (event: PeriodicSyncEvent) => any) {
		context.addEventListener('periodicsync' as any, handler);
		return this;
	}
	public onSync(handler: (event: SyncEvent) => any) {
		context.addEventListener('sync' as any, handler);
		return this;
	}
	public onPush(handler: (event: PushEvent) => any) {
		context.addEventListener('push', handler);
		return this;
	}
	public onMessage(
		handler: (this: BroadcastChannel, event: MessageEvent) => any
	) {
		this.channel.addEventListener('message', handler);
		return this;
	}

	public async send(message: any) {
		this.channel.postMessage(message);
		return this;
	}
	public async receive(handler: (message: any) => void) {
		this.message_handlers.add(handler);
		return this;
	}
	public async register(plugin: PluginRegister) {
		await plugin(this, context);
		return this;
	}
	public async route(route: Route) {
		const method = route.method;
		const url = route.url;
		if (typeof method == 'string' && method != '*') {
			if (typeof url == 'string') {
				this.table_route_static.set(`${method}:${url}`, route);
			} else {
				let url_raw = url + '';
				url_raw = url_raw.substring(1, url_raw.length - 1);
				this.table_route_dynamic.set(
					new RegExp(`${method}\:${url_raw}`),
					route
				);
			}
		} else {
			let method_raw: string;
			if (method == '*') {
				method_raw = '.*';
			} else {
				method_raw = `(${method.join('|')})`;
			}
			if (typeof url == 'string') {
				this.table_route_dynamic.set(
					new RegExp(`${method_raw}\:${url}`),
					route
				);
			} else {
				let url_raw = url + '';
				url_raw = url_raw.substring(1, url_raw.length - 1);
				this.table_route_dynamic.set(
					new RegExp(`${method_raw}\:${url_raw}`),
					route
				);
			}
		}
		return this;
	}

	public async download() {
		try {
			const cache = await caches.open(this.options.cachename);
			await cache.addAll(this.options.resources);
			return context.skipWaiting();
		} catch (error: any) {
			this.options.debug && console.error(error);
		}
	}
	public async clean() {
		try {
			const keys = await caches.keys();
			for (const key of keys) {
				if (key != this.options.cachename) {
					await caches.delete(key);
				}
			}
			await local.del('cache-util');
			return context.clients.claim();
		} catch (error: any) {
			this.options.debug && console.error(error);
		}
	}
	public async proxying(request: Request) {
		const route = this.lookup(request) ?? default_route;
		const util: any = {};
		const task = await route.handler(request, util);
		const req_util = new RequestUtil(task);
		const cache_util = new CacheUtil(task);

		let response: Response | undefined;

		req_util.debug = this.options.debug;
		cache_util.debug = this.options.debug;
		cache_util.fetch = req_util.send.bind(req_util);

		this.options.debug &&
			console.log(
				'[route]',
				`${request.method}:${request.url}`,
				'===',
				`${route.method}:${route.url}`
			);

		try {
			response = await cache_util.store(request);
		} catch (error: any) {
			this.options.debug && console.error(error);
		}
		if (response) return response;
		return fetch(request);
	}
	public lookup(request: Request) {
		const str_url = request.url;
		const str_method = request.method;
		const req_address = `${str_method}:${str_url}`;
		for (const [address, route] of this.table_route_static) {
			if (address == req_address) {
				return route;
			}
		}
		for (const [regex, route] of this.table_route_dynamic) {
			if (regex.test(req_address)) {
				return route;
			}
		}
	}
}
function wait<R = any>(timeout: number, handler: Function) {
	return new Promise<R>((resolver, rejector) => {
		setTimeout(() => {
			resolver(handler());
		}, timeout);
	});
}
function promiseify<R = any>() {
	let resolver: (value: R) => void = (v) => v;
	let rejector: (reason: any) => void = (r) => r;
	const promise = new Promise<R>((resolve, reject) => {
		resolver = resolve;
		rejector = reject;
	});
	return {
		resolver,
		rejector,
		promise,
	};
}
interface RequestUtilOptions {
	timeout?: number;
	online?: boolean;
	retry_interval?: number;
	retry_times?: number;
}
const request_util_default_options: RequestUtilOptions = {
	timeout: 0,
	online: true,
	retry_interval: 0,
	retry_times: 0,
};
class RequestUtil {
	static ERR_NET_OFFLINE = 'net::ERR_FAILED';
	public debug = true;
	public abort_controller = new AbortController();
	public options: Required<RequestUtilOptions>;
	protected sending = false;
	protected retrying = false;
	protected retry_count = 0;
	protected retry_id: any = 0;
	protected result = promiseify<Response>();
	constructor(options?: RequestUtilOptions) {
		this.options = Object.assign(
			{},
			request_util_default_options,
			options
		) as any;
		this.result.promise.finally(() => {
			this.sending = false;
			this.retrying = false;
			this.retry_count = 0;
			this.result = promiseify();
		});
	}
	public async send(request: Request) {
		if (!this.sending) {
			this.debug &&
				console.log('[req-util] sending', request.method, request.url);
			const new_request = new Request(request, {
				signal: this.abort_controller.signal,
			});
			try {
				if (!context.navigator.onLine) {
					throw new Error(RequestUtil.ERR_NET_OFFLINE);
				}
				this.sending = true;
				let id: any = 0;
				if (this.options.timeout) {
					id = setTimeout(() => {
						this.abort_controller.abort();
					}, this.options.timeout);
				}
				const response = await fetch(new_request);
				this.result.resolver(response);
				id && clearTimeout(id);
			} catch (error: any) {
				this.debug && console.error(error);
				if (!context.navigator.onLine && !this.options.online) {
					this.result.rejector(error);
				} else {
					await this.retry(new_request, error);
				}
			} finally {
			}
		}
		return this.result.promise;
	}
	public retry(request: Request, error?: Error) {
		if (!this.options.retry_interval) {
			this.result.rejector(error);
		}
		if (!this.retrying) {
			this.retrying = true;
			this.retry_id = setInterval(async () => {
				if (this.retry_count >= this.options.retry_times) {
					this.result.rejector(error);
					clearInterval(this.retry_id);
				} else {
					this.retry_count++;
				}
				this.debug &&
					console.log(
						'[req-util] retrying',
						this.retry_count,
						'/',
						this.options.retry_times,
						'-',
						this.options.retry_interval,
						'/',
						's',
						request.url
					);
				try {
					const response = await this.send(request);
					this.result.resolver(response);
					clearInterval(this.retry_id);
				} catch (error: any) {
					if (this.retry_count >= this.options.retry_times) {
						this.result.rejector(error);
						clearInterval(this.retry_id);
					} else {
						this.retry_count++;
					}
				} finally {
				}
			}, this.options.retry_interval);
		}
		return this.result.promise;
	}
}
interface CachetUtilOptions {
	cache_name?: string;
	strategy:
	| 'revalidate'
	| 'net-first'
	| 'cache-first'
	| 'net-only'
	| 'cache-only';
	expire?: number;
}
interface CacheExpiration {
	keys: {
		[name: string]: number;
	};
}
const cache_util_default_options: CachetUtilOptions = {
	cache_name: 'cache-util',
	strategy: 'revalidate',
	expire: 0,
};
class CacheUtil {
	public debug = true;
	public key = 'cache-util';
	public options: Required<CachetUtilOptions>;
	public cacheOptions: CacheQueryOptions = {
		ignoreMethod: false,
		ignoreSearch: false,
		ignoreVary: true,
	};
	public not_found = new Response('Not found', {
		status: 404,
		statusText: 'Not Found',
	});
	constructor(options?: CachetUtilOptions) {
		this.options = Object.assign(
			{},
			cache_util_default_options,
			options
		) as any;
	}
	public notFound() {
		return this.not_found.clone();
	}
	public fetch(request: Request) {
		return fetch(request);
	}
	public async store(request: Request) {
		this.expiration(this.options);
		const { strategy, cache_name } = this.options;
		if (strategy == 'revalidate') {
			const cache = await caches.open(cache_name);
			return this.revalidate(request, cache);
		} else if (strategy == 'net-first') {
			const cache = await caches.open(cache_name);
			return this.netFirst(request, cache);
		} else if (strategy == 'net-only') {
			return this.netOnly(request);
		} else if (strategy == 'cache-first') {
			const cache = await caches.open(cache_name);
			return this.cacheFirst(request, cache);
		} else if (strategy == 'cache-only') {
			const cache = await caches.open(cache_name);
			return this.cacheOnly(cache, request);
		}
	}
	public async expiration({ cache_name, expire }: Required<CachetUtilOptions>) {
		let data = await local.get<CacheExpiration>(this.key);
		if (!data) {
			data = { keys: {} };
		}
		const now = Date.now();
		for (const [name, time] of Object.entries(data.keys)) {
			if (time <= now) {
				caches.delete(name);
				delete data.keys[name];
				this.debug &&
					console.log(
						'[cache-util] expiration',
						new Date(time).toLocaleString(),
						'-',
						(now - time) / 1e3,
						'/s',
						'=',
						name
					);
			}
		}
		if (!expire) return;
		if (!cache_name) return;
		if (!data.keys[cache_name]) {
			const time = now + expire;
			data.keys[cache_name] = now + expire;
			this.debug &&
				console.log(
					'[cache-util] expiration on',
					new Date(time).toLocaleString(),
					'-',
					cache_name
				);
		}
		await local.set(this.key, data);
		return;
	}
	public async revalidate(request: Request, cache: Cache) {
		this.debug &&
			console.log(
				'[cache-util] strategy',
				this.options.strategy,
				'>',
				'revalidate',
				request.url
			);
		let response = await this.loadCache(cache, request);
		if (response) {
			this.waitPutCache(cache, request);
		} else {
			response = await this.fetch(request);
			this.waitPutCache(cache, request, response.clone());
		}
		return response;
	}
	public netFirst(request: Request, cache: Cache) {
		this.debug &&
			console.log(
				'[cache-util] strategy',
				this.options.strategy,
				'>',
				'net-first',
				request.url
			);
		return this.fetch(request)
			.then((response) => {
				this.waitPutCache(cache, request, response.clone());
				return response;
			})
			.catch((error) => {
				return this.cacheOnly(cache, request);
			});
	}
	public async netOnly(request: Request) {
		this.debug &&
			console.log(
				'[cache-util] strategy',
				this.options.strategy,
				'>',
				'net-only',
				request.url
			);
		return this.fetch(request);
	}
	public async cacheFirst(request: Request, cache: Cache) {
		this.debug &&
			console.log(
				'[cache-util] strategy',
				this.options.strategy,
				'>',
				'cache-first',
				request.url
			);
		let response = await this.loadCache(cache, request);
		if (!response) {
			response = await this.fetch(request);
			this.waitPutCache(cache, request, response.clone());
		}
		return response;
	}
	public cacheOnly(cache: Cache, request: Request) {
		this.debug &&
			console.log(
				'[cache-util] strategy',
				this.options.strategy,
				'>',
				'cache-only',
				request.url
			);
		return this.loadCache(cache, request).then((response) => {
			if (response) {
				return response;
			} else {
				return this.notFound();
			}
		});
	}
	public loadCache(cache: Cache, request: Request) {
		return cache.match(request, this.cacheOptions);
	}
	public waitPutCache(cache: Cache, request: Request, response?: Response) {
		return wait(0, async () => {
			if (!response) {
				response = await this.fetch(request);
			}
			if (response.ok) {
				cache.put(request, response);
			}
		});
	}
}
