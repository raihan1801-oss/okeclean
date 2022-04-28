import Api from '$server/utility/api';
import type { Version } from '$server/utility/api';
import type { ServerSentEvent, WebSocketMessage } from '$server/global';

import { Promiseify } from './helper';

export { Version };
export interface Options {
	base?: string;
	esbase?: string;
	wsbase?: string;
	version?: Version | '';
	path?: string;
	mode?: RequestMode;
	serialize?: boolean;
	deserialize?: boolean;
	onrequest?: (request: Request) => void;
	onresponse?: (response: Response) => void;
	debug?: boolean;
}

const defaultOptions: Options = {
	base: '',
	esbase: '',
	wsbase: '',
	version: '',
	path: '',
	debug: true,
	mode: 'same-origin',
	serialize: true,
	deserialize: true,
};

export type { ClientWebSocket };

export default class ClientApi {
	public static readonly Utility = Api;
	public persisted_connection: {
		ws?: ClientWebSocket;
		event?: ClientServerSentEvent;
	} = {};
	public get Error() {
		return Api.Error.Const;
	}
	public readonly options: Required<Options>;
	public url: string;
	constructor(options?: Options) {
		this.options = Object.seal(
			Object.assign({}, defaultOptions, options)
		) as Required<Options>;
		const { base, version, path } = this.options;
		this.url = `${base}${version ? `/${version}` : ''}`;
		if (path) {
			this.url += path;
		}
	}
	public clone(options?: Options) {
		const opts = Object.assign(
			{},
			defaultOptions,
			this.options,
			options
		) as Required<Options>;
		return new ClientApi(opts);
	}
	public request<Body = any>(
		options: {
			endpoint?: string;
			query?: Record<string, string>;
			method?: Method;
			headers?: Record<string, string>;
			body?: Body;
		} = {}
	) {
		const { mode, serialize, deserialize, onrequest, onresponse, debug } =
			this.options;
		let { endpoint, query, method, headers, body } = options;
		let url = this.url;
		if (endpoint) {
			url += `/${endpoint}`;
		}
		if (query) {
			url += `?${Api.toQueryString(query)}`;
		}
		return new ClientRequestApi<Body>({
			url,
			method,
			headers: new Headers(headers),
			body,
			mode,
			serialize,
			deserialize,
			onrequest,
			onresponse,
			debug,
		});
	}
	public es(options?: { endpoint?: string; persist?: boolean }) {
		let url = this.options.esbase;
		url += `${this.options.path ? this.options.path : ''}${
			options?.endpoint ? '/' + options?.endpoint : ''
		}`;
		return new ClientServerSentEvent({
			url,
			persisted: options?.persist,
			debug: this.options.debug
		});
	}
	public ws(options?: { endpoint?: string; persist?: boolean }) {
		let url = this.options.wsbase;
		url += `/${this.options.version}${this.options.path ? this.options.path : ''}${
			options?.endpoint ? '/' + options?.endpoint : ''
		}`;
		return new ClientWebSocket({
			url,
			persisted: options?.persist,
			debug: this.options.debug
		});
	}
}

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'OPTION';

interface ClientRequestApiOptions<Body = BodyInit | null> {
	url: string;
	method: Method;
	headers: Headers;
	body?: Body;
	mode: RequestMode;
	serialize: boolean;
	deserialize: boolean;
	onrequest?: (request: Request) => void;
	onresponse?: (response: Response) => void;
	debug: boolean;
}

const clientRequestApiOptionsdefault: ClientRequestApiOptions = {
	url: '',
	method: 'GET',
	headers: new Headers(),
	body: null,
	mode: 'same-origin',
	serialize: true,
	deserialize: true,
	debug: true,
};

class ClientRequestApi<Body = BodyInit | null> {
	public options: ClientRequestApiOptions<Body>;
	public raw: Request;
	constructor(options?: Partial<ClientRequestApiOptions<Body>>) {
		this.options = Object.seal(
			Object.assign({}, clientRequestApiOptionsdefault, options)
		) as ClientRequestApiOptions<Body>;
		this.raw = this.init();
		this.options.onrequest?.(this.raw);
	}
	protected init() {
		if (this.options.serialize) {
			this.options.body = this.serializer(
				this.options.headers,
				this.options.body
			);
		}
		return new Request(this.options.url, {
			method: this.options.method,
			headers: this.options.headers,
			body: this.options.body as any,
			mode: 'same-origin',
		});
	}
	protected serializer(headers: Headers, body?: Body): any {
		if (typeof body == 'string' ) {
			headers.append('Content-Type', 'text/plain;charset=UTF-8');
			return body;
		} else if (body instanceof File) {
			return body;
		} else if (body instanceof FormData) {
			return body;
		} else if (body instanceof ReadableStream) {
			return body;
		} else {
			headers.append('Content-Type', 'application/json;charset=UTF-8');
			return JSON.stringify(body);
		}
	}
	public async send<Payload = any>() {
		const response = await fetch(this.raw);
		return new ClientResponseApi<Payload>(response, {
			deserialize: this.options.deserialize,
			onresponse: this.options.onresponse,
			debug: this.options.debug,
		});
	}
}

interface ClientResponseApiOptions {
	deserialize: boolean;
	onresponse?: (response: Response) => void;
	debug: boolean;
}

const clientResponseApiOptionsdefault: ClientResponseApiOptions = {
	deserialize: true,
	debug: true,
};

class ClientResponseApi<Body> {
	public options: ClientResponseApiOptions;
	public raw: Response;
	constructor(response: Response, options: Partial<ClientResponseApiOptions>) {
		this.raw = response;
		this.options = Object.seal(
			Object.assign({}, clientResponseApiOptionsdefault, options)
		) as ClientResponseApiOptions;
		this.options.onresponse?.(this.raw);
	}
	protected deserializer(response: Response) {
		const type = response.headers.get('Content-Type');
		if (type?.startsWith('multipart/form-data')) {
			return response.formData();
		} else if (type?.startsWith('image')) {
			return response.blob();
		} else if (type?.startsWith('application/json')) {
			return response.json();
		} else {
			return response.text();
		}
	}
	public async read() {
		let body: any = undefined;
		if (this.options.deserialize) {
			body = this.deserializer(this.raw);
		}
		if (this.raw.status > 399) {
			throw new Api.Error.From(await body);
		} else {
			return body as Body;
		}
	}
}

interface ClientServerSentEventApiOptions {
	url: string;
	persisted?: boolean;
	debug?: boolean;
}
interface ClientServerSentEventApiHandler {
	(data: any): void;
}

const clientServerSentEventApiOptionsdefault: ClientServerSentEventApiOptions =
	{
		url: '',
		persisted: false,
		debug: true,
	};

class ClientServerSentEvent {
	static persisted: Record<string, ClientServerSentEvent> = {};
	public opened: Promiseify<ClientServerSentEvent>;
	public closed: Promiseify<ClientServerSentEvent>;
	public raw!: EventSource;
	public messageHandlers = new Map<
		string,
		Set<ClientServerSentEventApiHandler>
	>();
	public options: Required<ClientServerSentEventApiOptions>;
	constructor(options: ClientServerSentEventApiOptions) {
		this.options = Object.seal(
			Object.assign({}, clientServerSentEventApiOptionsdefault, options)
		) as any;
		this.opened = new Promiseify();
		this.closed = new Promiseify();
		if (this.options.persisted) {
			this.assign(ClientServerSentEvent.persisted[this.options.url]);
		}
	}
	protected init() {
		if (!this.raw) {
			if (this.options.url.startsWith('/')) {
				this.options.url = location.origin + this.options.url;
			}
			this.raw = new EventSource(this.options.url, { withCredentials: true });
			this.raw.addEventListener(
				'open',
				(event) => {
					if (this.options.persisted) {
						ClientServerSentEvent.persisted[this.options.url] = this;
					}
					this.opened.resolver(this);
					this.options.debug && console.log('[SSE] open', this.options.url);
				},
				{ once: true }
			);
			this.raw.addEventListener(
				'close',
				(event) => {
					if (this.options.persisted) {
						delete ClientServerSentEvent.persisted[this.options.url];
					}
					this.closed.resolver(this);
					this.options.debug && console.log('[SSE] close', this.options.url);
				},
				{ once: true }
			);
			this.raw.addEventListener('message', this.internal_onmessage);
		}
	}
	public release() {
		this.clean();
		if (this.raw) {
			this.raw.removeEventListener('message', this.internal_onmessage);
			this.raw.close();
			this.raw.dispatchEvent(new CloseEvent('close'));
		}
	}
	protected internal_onmessage = (event: MessageEvent) => {
		const data: ServerSentEvent = this.derializer(event.data);
		this.publish(data.tag, data.data);
	};
	protected publish<D = any>(tag: string, data: D) {
		const handlers = this.messageHandlers.get(tag);
		if (handlers) {
			for (const handler of handlers) {
				handler(data);
			}
		}
	}
	protected assign(persisted: ClientServerSentEvent) {
		if (persisted) {
			this.opened = persisted.opened;
			this.closed = persisted.closed;
			this.messageHandlers = persisted.messageHandlers;
			this.options = persisted.options;
			this.raw = persisted.raw;
		}
	}
	public derializer<M = any>(message: any) {
		return JSON.parse(message) as M;
	}
	public message(tag: string, handler: (data: any) => void) {
		let handlers = this.messageHandlers.get(tag);
		if (handlers) {
			handlers.add(handler);
		} else {
			handlers = new Set<ClientServerSentEventApiHandler>();
			handlers.add(handler);
			this.messageHandlers.set(tag, handlers);
		}
		return this;
	}
	public clean() {
		for (const [tag, handlers] of this.messageHandlers) {
			handlers.clear();
		}
		this.messageHandlers.clear();
	}

	public open() {
		this.init();
		return this.opened;
	}
	public close() {
		this.release();
		return this.closed;
	}
	public addEventListener<K extends keyof EventSourceEventMap>(
		type: K,
		listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	) {
		return this.raw.addEventListener(type, listener, options);
	}
	public removeEventListener<K extends keyof EventSourceEventMap>(
		type: K,
		listener: (this: EventSource, ev: EventSourceEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	) {
		return this.raw.removeEventListener(type, listener, options);
	}
}

interface ClientWebSocketApiOptions {
	url: string;
	persisted?: boolean;
	debug?: boolean;
}
interface ClientWebSocketApiHandler {
	(data: any): void;
}

const clientWebSocketApiOptionsdefault: ClientWebSocketApiOptions = {
	url: '',
	persisted: false,
	debug: true,
};

class ClientWebSocket {
	static persisted: Record<string, ClientWebSocket> = {};

	public opened: Promiseify<ClientWebSocket>;
	public closed: Promiseify<ClientWebSocket>;
	public raw!: WebSocket;
	public options: Required<ClientWebSocketApiOptions>;
	public messageHandlers = new Map<string, Set<ClientWebSocketApiHandler>>();
	constructor(options?: ClientWebSocketApiOptions) {
		this.options = Object.seal(
			Object.assign({}, clientWebSocketApiOptionsdefault, options)
		) as any;
		this.opened = new Promiseify();
		this.closed = new Promiseify();
		if (this.options.persisted) {
			this.assign(ClientWebSocket.persisted[this.options.url]);
		}
	}
	protected init() {
		if (!this.raw) {
			if (this.options.url.startsWith('/')) {
				this.options.url =
					location.origin.replace('http', 'ws') + this.options.url;
			}
			this.raw = new WebSocket(this.options.url);
			this.raw.addEventListener(
				'open',
				(event) => {
					if (this.options.persisted) {
						ClientWebSocket.persisted[this.options.url] = this;
					}
					this.opened.resolver(this);
					this.options.debug && console.log('[WS] open', this.options.url);
				},
				{ once: true }
			);
			this.raw.addEventListener(
				'close',
				(event) => {
					if (this.options.persisted) {
						delete ClientWebSocket.persisted[this.options.url];
					}
					this.closed.resolver(this);
					this.options.debug && console.log('[WS] close', this.options.url);
				},
				{ once: true }
			);
			this.raw.addEventListener('message', this.internal_onmessage);
		}
	}
	protected release(code?: number, reason?: string) {
		this.clean();
		if (this.raw) {
			this.raw.removeEventListener('message', this.internal_onmessage);
			this.raw.close(code, reason);
		}
		return this;
	}
	protected internal_onmessage = (event: MessageEvent<string>) => {
		const data: WebSocketMessage = this.derializer(event.data);
		this.publish(data.tag, data.data);
	};
	protected assign(persisted: ClientWebSocket) {
		if (persisted) {
			this.opened = persisted.opened;
			this.closed = persisted.closed;
			this.messageHandlers = persisted.messageHandlers;
			this.options = persisted.options;
			this.raw = persisted.raw;
		}
	}
	protected publish<D = any>(tag: string, data: D) {
		const handlers = this.messageHandlers.get(tag);
		if (handlers) {
			for (const handler of handlers) {
				handler(data);
			}
		}
	}
	public serializer<M = any>(message: M) {
		return JSON.stringify(message);
	}
	public derializer<M = any>(message: any) {
		return JSON.parse(message) as M;
	}
	public clone(options?: ClientWebSocketApiOptions & { inherit?: boolean }) {
		const client = new ClientWebSocket(Object.assign(this.options, options));
		if (options?.inherit) {
			client.raw = this.raw;
			client.opened = this.opened;
			client.closed = this.closed;
		}
		return client;
	}
	public clean() {
		for (const [tag, handlers] of this.messageHandlers) {
			handlers.clear();
		}
		this.messageHandlers.clear();
	}

	public open() {
		this.init();
		return this.opened;
	}
	public close(code?: number, reason?: string) {
		this.release(code, reason);
		return this.closed;
	}
	public send<D = any>(tag: string, data: D) {
		this.raw.send(this.serializer({ tag, data }));
		return this;
	}
	public receive(tag: string, handler: ClientWebSocketApiHandler) {
		let handlers = this.messageHandlers.get(tag);
		if (handlers) {
			handlers.add(handler);
		} else {
			handlers = new Set<ClientWebSocketApiHandler>();
			handlers.add(handler);
			this.messageHandlers.set(tag, handlers);
		}
		return this;
	}

	public addEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	) {
		return this.raw.addEventListener(type, listener, options);
	}
	public removeEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	) {
		return this.raw.removeEventListener(type, listener, options);
	}
}
