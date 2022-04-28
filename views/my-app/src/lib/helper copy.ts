export function isBoolean(arg: any) {
	return typeof arg === 'boolean';
}

export function isNumber(arg: any) {
	return typeof arg === 'number';
}

export function isString(arg: any) {
	return typeof arg === 'string';
}

export function isSymbol(arg: any) {
	return typeof arg === 'symbol';
}

export function isUndefined(arg: any) {
	return typeof arg === 'undefined';
}

export function isPrimitive(arg: any) {
	return (
		isBoolean(arg) ||
		isNumber(arg) ||
		isString(arg) ||
		isSymbol(arg) ||
		isUndefined(arg) ||
		isNull(arg) ||
		false
	);
}

export function isNull(arg: any) {
	return arg === null;
}

export function isNan(arg: any) {
	return window.isNaN(arg);
}

export function isFinite(arg: any) {
	return window.isFinite(arg);
}

export function isObject(arg: any) {
	return typeof arg === 'object';
}

export function isRegExp(arg: any) {
	return getConstructName(arg) === 'RegExp';
}

export function isArray(arg: any) {
	return getConstructName(arg) === 'Array';
}

export function isConstructable(arg: any) {
	try {
		new arg();
	} catch (err) {
		return false;
	}
	return true;
}

export function isClass(arg: any) {
	return arg?.toString()?.startsWith('class');
}

export function isSameType(...args: any[]) {
	const t1 = getConstructName(args[0]);
	return args.every((value) => {
		return getConstructName(value) === t1;
	});
}

export function getConstructName(arg: any): string {
	if (typeof arg?.name === 'string' && arg?.name !== '') {
		return arg.name;
	} else {
		return arg.constructor.name;
	}
}

export function addProperty(source: object, key: string, value: any): object {
	return Object.defineProperty(source, key, {
		configurable: true,
		enumerable: true,
		value: value,
		writable: true,
	});
}

export function addProperties(source: object, target: object) {
	for (const [key, value] of Object.entries(target)) {
		addProperty(source, key, value);
	}
	return source;
}

export class Promiseify<T = any> extends Promise<T> {
	static get [Symbol.species]() {
		return Promise;
	}
	resolver!: (value?: T) => void;
	rejector!: (error: any) => void;
	constructor(
		executor?: (
			resolve: (value: T) => void,
			reject: (error: any) => any
		) => void
	) {
		let resolver: any;
		let rejector: any;
		super((resolve, reject) => {
			resolver = resolve;
			rejector = reject;
			executor?.(resolve, reject);
		});
		this.resolver = resolver;
		this.rejector = rejector;
	}
}

const ref = new WeakSet();
export function duplicate<T extends object>(object: T): T {
	if (isObject(object) === false) {
		throw new TypeError('wrong type');
	} else {
		if (ref.has(object)) {
			return null as unknown as T;
		} else {
			ref.add(object);
		}
	}
	if (isArray(object)) {
		let index = 0;
		const result: Array<unknown> = [];
		for (const iterator of object as Array<unknown>) {
			if (isObject(iterator)) {
				const tmp = duplicate(iterator as T);
				result[index] = tmp;
			} else {
				result[index] = iterator;
			}
			index++;
		}
		return result as T;
	} else {
		const result = {} as T;
		for (const [key, value] of Object.entries(object)) {
			if (isObject(value)) {
				const tmp = duplicate(value);
				addProperty(result, key, tmp);
			} else {
				addProperty(result, key, value);
			}
		}
		return result;
	}
}
export function unsafeDuplicate<T extends object>(object: T): T {
	if (isArray(object)) {
		let index = 0;
		const result: Array<unknown> = [];
		for (const value of object as Array<unknown>) {
			if (!isNull(value) && isObject(value)) {
				const tmp = unsafeDuplicate(value as T);
				result[index] = tmp;
			} else {
				result[index] = value;
			}
			index++;
		}
		return result as T;
	} else {
		const result = {} as T;
		for (const [key, value] of Object.entries(object)) {
			if (!isNull(value) && isObject(value)) {
				const tmp = unsafeDuplicate(value);
				addProperty(result, key, tmp);
			} else {
				addProperty(result, key, value);
			}
		}
		return result;
	}
}

export function mix<T extends object, K extends object>(source: T, target: K) {
	for (const [key, value] of Object.entries(target)) {
		if (key in source) {
			if (typeof source[key as keyof T] == typeof value) {
				source[key as keyof T] = value;
			} else {
				console.warn('attribute', key, 'different type in', source);
			}
		} else {
			console.warn('attribute', key, 'not exist in', source);
		}
	}
}

export function genRandomNumber(length: number = 0) {
	return +Math.random()
		.toFixed()
		.slice(2, length + 2);
}

export function genRandomString(length: number = 0) {
	const allCapsAlpha = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
	const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];
	const base = [...allLowerAlpha, ...allCapsAlpha];
	return [...Array(length)]
		.map((value) => {
			const digit = Math.random() * base.length;
			return base[digit % 2 ? Math.ceil(digit) : Math.floor(digit)];
		})
		.join('');
}

export function hash(str = '', key = 0) {
	let hash = key;
	let index = str.length;
	while (index) {
		hash = (hash * 37) ^ str.charCodeAt(--index);
	}
	return (hash >>> 0).toString(36);
}

export function domParser(string: string) {
	const dom = new DOMParser();
	return dom.parseFromString(string, 'text/html').body.firstElementChild;
}

export function trim(string: string): string {
	return string.replace(/\s|\n/g, '');
}

const refWait = new WeakMap<any, any>();
export function wait<
	Arg = undefined,
	ThisArg = undefined,
	Callback = (this: ThisArg, arg: Arg) => unknown,
	Return = Callback extends (this: any, arg: Arg) => infer R
		? R extends Promise<infer T>
			? T
			: R
		: unknown
>({
	timeout,
	delay,
	callback,
	thisArg,
	arg,
}: {
	timeout: number;
	delay?: number;
	callback?: Callback;
	arg?: Arg;
	thisArg?: ThisArg;
}): Promise<Return> {
	const promise = new Promiseify();
	if (callback) {
		if (delay) {
			clearTimeout(refWait.get(callback));
			const id = setTimeout(() => {
				promise.resolver((callback as any).apply(null, [arg]));
				// if (result instanceof Promise) {
				//   result.then((value) => {
				//     promise.resolver(value);
				//   })
				// } else {
				// }
			}, timeout + delay);
			refWait.set(callback, id);
		} else {
			setTimeout(() => {
				promise.resolver((callback as any).apply(null, [arg]));
			}, timeout);
		}
	} else {
		setTimeout(() => {
			promise.resolver();
		}, timeout);
	}
	return promise;
}
export function waitFrame<R>(ms?: number, callback?: (time: number) => R) {
	return new Promise<R>((resolve) => {
		setTimeout(() => {
			requestAnimationFrame((time) => {
				resolve(callback ? callback(time) : (undefined as unknown as R));
			});
		}, ms);
	});
}
export function parseDataUri(dataUri: string) {
	const [, mime, text] = /data:(.*);base64,(.*)/.exec(
		dataUri
	) as RegExpExecArray;
	const data = atob(text);
	const view = new DataView(new ArrayBuffer(data.length));
	for (let index = 0; index < data.length; index++) {
		view.setUint8(index, data.charCodeAt(index));
	}
	return {
		mime,
		data,
		view,
	};
}
export async function blobToDataUri(blob: Blob | File) {
	const reader = new FileReader();
	const result = new Promiseify<string>((resolve) => {
		reader.addEventListener('load', () => {
			resolve(reader.result as string);
		});
	});
	reader.readAsDataURL(blob);
	return result;
}
export async function dataUriToBlob(dataUri: string) {
	const { mime, data, view } = parseDataUri(dataUri);
	return new Blob([view.buffer], { type: mime });
}
export async function getImageUrl(url: string, init?: RequestInit) {
	const response = await fetch(url, init);
	return URL.createObjectURL(await response.blob());
}
export function mediaQuery(
	query: string,
	handler: (media: MediaQueryList) => void
) {
	const media = matchMedia(query);
	if (media.matches) {
		handler(media);
	}
	media.addEventListener('change', (event) => {
		event.matches && handler(media);
	});
}
export class Diff {
	static array<A extends Array<any>, R = A>(
		imutable: A,
		mutable: A
	): R | undefined {
		const result: R = [] as unknown as R;
		for (const [key, i_value] of Object.entries(imutable)) {
			let m_value = mutable[key] as any;
			if (typeof i_value == typeof m_value) {
				if (typeof i_value == 'object') {
					let temp: any = undefined;
					if (Array.isArray(i_value) && Array.isArray(m_value)) {
						temp = Diff.array(imutable[key], mutable[key]);
					} else if (i_value != null && m_value != null) {
						temp = Diff.object(imutable[key], mutable[key]);
					}
					if (temp == undefined) {
						continue;
					} else {
						m_value = temp;
					}
				}
				if (i_value != m_value) {
					result[key] = m_value;
				}
			} else {
				result[key] = m_value;
			}
		}
		if ((result as any).length) {
			return result;
		} else {
			return undefined;
		}
	}
	static object<O extends object, R = { [P in keyof O]?: O[P] }>(
		imutable: O,
		mutable: O
	): R | undefined {
		const result: R = {} as unknown as R;
		for (const [key, i_value] of Object.entries(imutable)) {
			let m_value = mutable[key as unknown as keyof O] as any;
			if (typeof i_value == typeof m_value) {
				if (typeof i_value == 'object') {
					let temp: any = undefined;
					if (Array.isArray(i_value) && Array.isArray(m_value)) {
						temp = Diff.array(imutable[key], mutable[key]);
					} else if (i_value != null && m_value != null) {
						temp = Diff.object(imutable[key], mutable[key]);
					}
					if (temp == undefined) {
						continue;
					} else {
						m_value = temp;
					}
				}
				if (i_value != m_value) {
					result[key as unknown as keyof R] = m_value;
				}
			} else {
				result[key as unknown as keyof R] = m_value;
			}
		}
		if (Object.keys(result).length) {
			return result;
		} else {
			return undefined;
		}
	}
	static objectCopy<O extends object>(original: O): O {
		return unsafeDuplicate(original);
	}
	static objectAssign<O extends object>(unchanged: O, changed: O): O {
		return Object.assign(unchanged, changed);
	}
}
export function toMoney(value: any) {
	const price = value.toString();
	const result: string[] = [];
	let count = 0;
	for (let index = price.length - 1; index >= 0; index--) {
		const char = price[index];
		if (char == '.') continue;
		if (count == 3) {
			count = 1;
			result.unshift('.');
		} else {
			count++;
		}
		result.unshift(char);
	}
	return result.join('');
}
export class Currency {
	static toMoney(value: string | number) {
		const price = value.toString();
		const result: string[] = [];
		let count = 0;
		for (let index = price.length - 1; index >= 0; index--) {
			const char = price[index];
			if (char == '.') continue;
			if (count == 3) {
				count = 1;
				result.unshift('.');
			} else {
				count++;
			}
			result.unshift(char);
		}
		return result.join('');
	}
	static toNumber(value: string | number) {
		return +value.toString().replace(/\./g, '');
	}
}
export function urlBase64ToUint8Array(base64String: string) {
	var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

	var rawData = window.atob(base64);
	var outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

type ListOfType =
	| 'string'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'symbol'
	| 'undefined'
	| 'object'
	| 'function';
type SubscribeHandler<T> = (
	value: T
) => void | (() => void) | Promise<() => void>;
type SubscribePatchHandler = UnsafeUtil.SubscribePatchHandler;

export type ChangePatch = UnsafeUtil.ChangePatch;

type TaskHandler<Data, Result> = (data: Data) => Promise<Result>;
type TaskKey = string | object | Function;
type Task<Data = any, Result = any> = {
	id: number;
	data: Data;
	key?: TaskKey;
	timeout?: number;
	timeoutId?: number;
	handler: TaskHandler<Data, Result>;
	resolve: (value: Result | PromiseLike<Result>) => void;
	reject: (reason?: any) => void;
};

export class ProcessManagementUnsafe {
	protected static global?: ProcessManagementUnsafe;
	static get instance() {
		return (
			this.global ?? (this.global = new ProcessManagementUnsafe('@global'))
		);
	}
	constructor(name = '', debug = false) {
		this.name = name;
		this.debug = debug;
		this.id = this.genPid();
	}
	get genPid() {
		return function* () {
			let id = 0;
			while (true) {
				yield ++id;
			}
		};
	}
	get isStarted() {
		return this.started;
	}
	get queued() {
		return this.taskQueue.length;
	}
	readonly name: string;
	protected readonly id: Generator<number, never, unknown>;
	private readonly derferQueue: Task[] = [];
	private readonly taskQueue: Task[] = [];
	private readonly keySet = new Set<TaskKey>();
	private readonly debug: boolean;
	private started = false;
	private isSleep = false;
	private wakeUp!: (value: Task) => void;
	private sleep() {
		return new Promise<Task>((resolve) => {
			this.debug && console.log(this.name + ' process sleep');
			this.debug && console.timeEnd(this.name + ' process live');
			this.wakeUp = resolve;
			this.isSleep = true;
		}).finally(() => {
			this.debug && console.log(this.name + ' process wake up');
			this.debug && console.time(this.name + ' process live');
			this.isSleep = false;
		});
	}
	private async *taskGenerator(): AsyncGenerator<Task> {
		while (true) {
			const task = this.taskQueue.shift();
			if (task) {
				yield task;
			} else {
				yield this.sleep();
			}
		}
	}
	queue<Data, Result, Key extends TaskKey | undefined>(
		data: Data,
		handler: TaskHandler<Data, Result>,
		key?: Key,
		timeout?: number
	) {
		if (timeout && !key) {
			throw TypeError('Cannot use timeout without key');
		}
		if (key && !timeout) {
			if (this.keySet.has(key)) {
				this.debug && console.warn(this.name + ' The task is locked');
				this.taskQueue.find((task) => task.id == 0)?.reject('lala');
				return { id: -1, promise: Promise.resolve(undefined) };
			} else {
				this.keySet.add(key);
			}
		}
		const id = this.id.next().value;
		return {
			id,
			promise: new Promise<Key extends undefined ? Result : Result | undefined>(
				(resolve, reject) => {
					const task: Task<Data, Result> = {
						id,
						data,
						key,
						timeout,
						handler,
						reject,
						resolve,
					};
					this.isSleep ? this.wakeUp(task) : this.taskQueue.push(task);
				}
			),
		};
	}
	dequeue(id: number) {
		let index = 0;
		for (const task of this.taskQueue) {
			if (task.id == id) {
				this.taskQueue.splice(index, 1);
				task.key && this.keySet.delete(task.key);
				return true;
			}
			index++;
		}
		return false;
	}
	lock(key: TaskKey) {
		this.keySet.add(key);
		return this;
	}
	unlock(key: TaskKey) {
		this.keySet.delete(key);
		return this;
	}
	start() {
		if (!this.started) {
			this.debug && console.log(this.name + ' process start');
			this.debug && console.time(this.name + ' process live');
			this.started = true;
			this.process();
		}
		return this;
	}
	private async process() {
		for await (const task of this.taskGenerator()) {
			if (task.timeout) {
				const index = this.derferQueue.findIndex(
					(deferTask) => deferTask.key == task.key
				);
				if (index > -1) {
					const deferTask = this.derferQueue.splice(index, 1)[0];
					clearTimeout(deferTask.timeoutId);
					this.debug && console.warn(this.name + ' process defer replace');
				}
				task.timeoutId = setTimeout(() => {
					this.isSleep ? this.wakeUp(task) : this.taskQueue.push(task);
					this.debug && console.log(this.name + ' process defer queue');
				}, task.timeout) as any;
				task.timeout = 0;
				this.derferQueue.push(task);
				continue;
			}
			try {
				task.resolve(await task.handler(task.data));
			} catch (error: any) {
				task.reject(new error.constructor(error.message));
			} finally {
				task.key && this.keySet.delete(task.key);
			}
		}
	}
	finish() {
		this.debug && console.log(this.name + ' process finish');
		this.started = false;
		return this;
	}
}

export class MemoryManagementUnsafe {
	protected finalizer = new FinalizationRegistry<string>((name) => {
		console.log('[Memory]', 'object', name, 'claimed');
	});
	protected refs = new Map<string, WeakRef<any>>();
	alloc(name: string, object: object) {
		const ref = new WeakRef(object);
		this.refs.set(name, ref);
		this.finalizer.register(object, name);
	}
	get<Type = any>(name: string) {
		return this.refs.get(name) as unknown as Type;
	}
	has(name: string) {
		return this.refs.has(name);
	}
	unalloc(name: string) {
		const ref = this.refs.get(name) as any;
		this.refs.delete(name);
		this.finalizer.unregister(ref);
	}
}

export class ObserverUnsafe<Raw> {
	// protected static process = new ProcessManagementUnsafe("@ObserverUnsafe");

	defer: boolean;
	debug: boolean;
	// deferTime: number;

	protected type: ListOfType;
	protected raw: Raw;
	protected subscribers: SubscribeHandler<Raw>[] = [];
	protected binds: WeakMap<ObserverUnsafe<Raw>, SubscribeHandler<Raw>> =
		new Map();
	// protected changeSet: ChangePatch[] = [];
	// protected observers: ((changeSet: ChangePatch[]) => void)[] = [];
	constructor(data: Raw, options?: { debug?: boolean; defer?: boolean }) {
		const defOpts = Object.assign(
			{},
			{ debug: true, defer: false },
			options
		) as {
			debug: boolean;
			defer: boolean;
		};
		this.type = typeof data;
		this.raw = data;
		this.defer = defOpts.defer;
		this.debug = defOpts.debug;
		// this.deferTime = 12;
	}
	loader?: () => Promise<any>;
	onLoad?: (data: any) => void;
	load() {
		this.loader && this.onLoad && this.onLoad(this.loader());
	}
	set(value: Raw) {
		if (value != this.raw) {
			const type = typeof value;
			if (type != this.type) {
				throw new TypeError(
					`Mismatch on type, expect ${this.type} but ${type}`
				);
			}
			this.raw = value;
			this.publish(value);
			// this.changeSet.push({ name: "set", info: [], data: value });
		}
		return this;
	}
	equal(value: Raw) {
		return this.raw == value;
	}
	get() {
		return this.raw;
	}
	update(value?: Raw) {
		this.publish(value ?? this.raw);
		return this;
	}
	bind(observeableData: ObserverUnsafe<Raw>, handler?: SubscribeHandler<Raw>) {
		handler =
			handler ??
			((value) => {
				observeableData.set(value);
			});
		this.binds.set(observeableData, handler);
		this.subscribe(handler);
		observeableData.set(this.raw).subscribe((value) => {
			this.set(value);
		});
		return this;
	}
	unbind(observeableData: ObserverUnsafe<Raw>) {
		const handler = this.binds.get(observeableData);
		if (handler) {
			this.unsubscribe(handler);
			observeableData.unbind(this);
		} else {
			throw new Error('bind not exist');
		}
		return this;
	}
	subscribe(handler: SubscribeHandler<Raw>) {
		const type = typeof handler;
		if (type == 'function') {
			this.subscribers.push(handler);
			const result = handler(this.raw);
			return () => {
				this.unsubscribe(handler);
				return result;
			};
		} else {
			throw new TypeError(`Mismatch on type, expect function but ${type}`);
		}
	}
	unsubscribe(handler: SubscribeHandler<Raw>): boolean {
		let index = 0;
		let pos = 0;
		for (const subscriber of this.subscribers) {
			if (Object.is(subscriber, handler)) {
				pos = index;
			}
			index++;
		}
		if (pos) {
			this.subscribers.splice(pos, 1);
			return true;
		} else {
			return false;
		}
	}
	clean() {
		this.subscribers = [];
		return this;
	}
	protected publish(value: Raw) {
		// this.debug &&
		// 	console.time('@' + this.constructor.name + ' publish ' + (this.defer ? 'defer' : ''));
		if (this.defer) {
			throw new TypeError('The defer not support yet');
			// ObserverUnsafe.process.queue(
			//   null,
			//   async () => {
			//     for (const subscriber of this.subscribers) {
			//       await subscriber(value);
			//     }
			//   },
			//   "publish",
			//   this.deferTime
			// );
		} else {
			for (const subscriber of this.subscribers) {
				subscriber(value);
			}
		}
		// this.debug &&
		// 	console.timeEnd('@' + this.constructor.name + ' publish ' + (this.defer ? 'defer' : ''));
	}

	[Symbol.toPrimitive](hint: 'string' | 'number' | 'default') {
		return this.raw;
	}
	[Symbol.isConcatSpreadable]: boolean = true;
	toJSON(key: string) {
		return this.raw;
	}
}
export class ObserverAPIUnsafe<RawValue> extends ObserverUnsafe<RawValue> {
	subscribersAPI: SubscribePatchHandler[] = [];
	subscribeAPI(handler: SubscribePatchHandler) {
		if (typeof handler == 'function') {
			this.subscribersAPI.push(handler);
		} else {
			throw new TypeError(
				`Mismatch on type, expect function but ${typeof handler}`
			);
		}
		return this;
	}
	unsubscribeAPI(handler: SubscribePatchHandler): boolean {
		for (let index = 0; index < this.subscribersAPI.length; index++) {
			if (Object.is(this.subscribersAPI[index], handler)) {
				this.subscribersAPI.splice(index, 1);
				return true;
			}
		}
		return false;
	}
	protected publishAPI(data: ChangePatch) {
		console.time(this.constructor.name + ' publish API');
		for (const subscriber of this.subscribersAPI) {
			subscriber(data);
		}
		console.timeEnd(this.constructor.name + ' publish API');
	}
}
export class ObserverPatch<Raw> implements UnsafeUtil.ObservablePatch<Raw> {
	protected raw: Raw;
	constructor(raw: Raw) {
		this.raw = raw;
	}
	protected changeSet: ChangePatch[] = [];
	protected subscribers: SubscribePatchHandler[] = [];
	loader?: () => any;
	onLoad?: (data: any) => Raw;
	load() {
		if (this.loader) {
			const data = this.loader();
			if (this.onLoad) {
				this.set(this.onLoad(data));
			} else {
				this.set(data);
			}
		} else {
			console.warn('[ObservablePatch] The loader not setup yet');
		}
	}
	set(value: Raw) {
		if (value != this.raw) {
			this.raw = value;
			this.change({ name: 'set', data: value });
		}
		return this;
	}
	equal(value: Raw) {
		return this.raw == value;
	}
	get() {
		return this.raw;
	}
	change(patch: ChangePatch) {
		if (this.subscribers.length) {
			this.changeSet.push(patch);
		}
		return this;
	}
	subscribe(handler: SubscribePatchHandler) {
		if (typeof handler == 'function') {
			this.subscribers.push(handler);
		} else {
			throw new TypeError(
				`Mismatch on type, expect function but ${typeof handler}`
			);
		}
		return this;
	}
	unsubscribe(handler: SubscribePatchHandler): boolean {
		for (let index = 0; index < this.subscribers.length; index++) {
			if (Object.is(this.subscribers[index], handler)) {
				this.subscribers.splice(index, 1);
				return true;
			}
		}
		return false;
	}
	notify() {
		console.time('[ObservablePatch] ' + this.constructor.name + ' notify');
		for (const subscriber of this.subscribers) {
			subscriber(this.changeSet);
		}
		this.changeSet.length = 0;
		console.timeEnd('[ObservablePatch] ' + this.constructor.name + ' notify');
		return this;
	}
}
export class ChangeTrackerUnsafe<RawValue> {
	stageList: RawValue[] = [];
	commitList: RawValue[] = [];
	head: RawValue;
	temp: RawValue;
	onChangeHandler: ((value: RawValue) => void) | null;
	onStageHandler: ((value: RawValue) => void) | null;
	copyMethod: (raw: RawValue) => RawValue;
	constructor(value: RawValue) {
		this.head = value;
		this.temp = value;
		this.copyMethod = (raw) =>
			Array.isArray(raw) ? (raw.slice() as unknown as RawValue) : raw;
		this.onChangeHandler = null;
		this.onStageHandler = null;
		this.stage();
		this.commit();
	}
	stage(change?: RawValue) {
		this.stageList.unshift(
			change
				? this.copyMethod((this.temp = change))
				: this.copyMethod(this.temp)
		);
		this.onStageHandler
			? this.onStageHandler(this.copyMethod(this.temp))
			: null;
		return this;
	}
	commit() {
		const stage = this.stageList.shift();
		if (stage) {
			this.commitList.unshift(stage);
			this.save(stage);
		} else {
			throw new Error('Cannot commit: ' + this.stageList.length);
		}
		return this;
	}
	revert() {
		if (this.commitList.length > 1) {
			this.stageList.unshift(this.commitList.shift() as RawValue);
			this.save(this.commitList[0]);
		} else {
			throw new Error('Cannot revert: ' + this.commitList.length);
		}
		return this;
	}
	save(change: RawValue) {
		this.head = this.copyMethod(change);
		this.temp = this.copyMethod(change);
		this.onChangeHandler ? this.onChangeHandler(this.copyMethod(change)) : null;
		return this;
	}
}

export function element_support(element: string, attribute: string) {
	return attribute in document.createElement(element);
}
