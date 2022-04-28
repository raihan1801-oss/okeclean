export interface EventEmitterInstanceSpec {
	receiver?: any;
	sender?: any;
	data?: any;
}

export interface EventEmitterSpec<T = string> extends EventEmitterInstanceSpec {
	readonly type: T;
	readonly timeCreate: number;
	prevent: boolean;
	cancelAble: boolean;

	stopDefaultEvent(): void;
	stopPropagation(): void;
}

export class EventEmitter<T = string> implements EventEmitterSpec<T> {
	public readonly type: T;
	public readonly timeCreate: number;

	public sender: object;
	public receiver: object;
	public data: object;

	cancelAble: boolean = false;
	prevent: boolean = false;

	constructor(type: T, options?: EventEmitterInstanceSpec) {
		this.type = type;
		this.timeCreate = Date.now();
		this.receiver = options?.receiver ?? {};
		this.sender = options?.sender ?? {};
		this.data = options?.data ?? {};
	}

	public stopPropagation() {
		this.cancelAble = true;
	}

	public stopDefaultEvent() {
		this.prevent = true;
	}
}

export interface EmitterSpec<T = string> {
	on(
		type: T,
		handler: ListenerHandler,
		options: ListenerOptions
	): ListenerId;
	emit(eventEmitter: EventEmitter<T> | T, ...args: any | undefined): void;
	remove(type: T, id: ListenerId): boolean;
}

export interface ListenerHandler {
	(event: EventEmitter, ...args: any | undefined): void;
}

export interface ListenerOptions {
	once?: boolean;
	passive?: boolean;
	default?: boolean;
}

export type ListenerId = number;

// export interface ListenerContainer {
//   [type: string]: ListenerQueue[]
// }

export interface ListenerQueue {
	handler: ListenerHandler;
	id: ListenerId;
	options: ListenerOptions;
}

export class Emitter<T = string> implements EmitterSpec<T> {
	private listenerMap = new Map<T, ListenerQueue[]>();
	private listenerIdGen: Generator<ListenerId, any, ListenerId> =
		(function* () {
			for (let index = 0; true; index++) {
				yield index + 1;
			}
		})();

	private listenerRegister(
		type: T,
		handler: ListenerHandler,
		options: ListenerOptions
	): ListenerId {
		const id: ListenerId = this.listenerIdGen.next().value as ListenerId;
		const listenerList = this.listenerMap.get(type);

		if (listenerList) {
			listenerList.push({ id, handler, options });
			listenerList.sort((a, b) => {
				if (a.options.default && !b.options.default) {
					return 0;
				} else if (!a.options.default && b.options.default) {
					return -1;
				} else {
					return 1;
				}
			});
		} else {
			this.listenerMap.set(type, [{ id, handler, options }]);
		}
		return id;
	}

	on(
		type: T,
		handler: ListenerHandler,
		options?: ListenerOptions
	): ListenerId {
		const DEFAULT_OPTIONS: ListenerOptions = {
			default: options?.default || false,
			once: options?.once || false,
			passive: options?.passive || false,
		};

		return this.listenerRegister(type, handler, DEFAULT_OPTIONS);
	}
	emit(eventEmitter: EventEmitter<T> | T, ...args: any): void {
		if (typeof eventEmitter == 'string') {
			eventEmitter = new EventEmitter<T>(eventEmitter);
		}
		const { type } = eventEmitter as EventEmitter<T>;

		let prevent = true;
		let propagation = true;
		let listenerList = this.listenerMap.get(type);

		if (!listenerList) {
			return undefined;
		}

		for (const listener of listenerList.slice()) {
			const callback = listener.handler;

			if (propagation) {
				if (listener.options.default) {
					if (prevent) {
						callback((eventEmitter as EventEmitter<any>), ...args);
					}
				} else {
					callback((eventEmitter as EventEmitter<any>), ...args);
				}
			} else {
				if (listener.options.passive) {
					callback((eventEmitter as EventEmitter<any>), ...args);
				}
			}

			if ((eventEmitter as EventEmitter<T>).prevent) {
				prevent = false;
			}
			if ((eventEmitter as EventEmitter<T>).cancelAble) {
				propagation = false;
			}
		}

		this.listenerMap.set(type, listenerList.filter((listener) => {
			const { once } = listener.options;
			if (once) {
				return false;
			} else {
				return true;
			}
		}));
	}
	remove(type: T, id: ListenerId): boolean {
		if (id < 1) {
			return false;
		};
		const listenerList = this.listenerMap.get(type);
		if (listenerList) {
			for (let index = 0; index < listenerList.length; index++) {
				const listener = listenerList[index];
				if (listener.id == id) {
					listenerList.splice(index, 1);
					return true;
				}
			}
		} else {
			return false;
		}
		return false;
	}
	removeById(id: ListenerId): boolean {
		for (const [type, listenerList] of this.listenerMap) {
			for (const listener of listenerList) {
				let index = 0;
				if (listener.id == id) {
					listenerList.splice(index, 1);
					return true;
				}
				index++;
			}
		}
		return false;
	}
}
