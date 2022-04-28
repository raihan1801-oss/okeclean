import { open } from './db';

import type { DBOpenRequest, DBScheme } from './db';

interface Scheme extends DBScheme {
	store: {
		user: Data;
	};
	index: {
		state: State;
		username: string;
	};
}
type Data = {
	state: State;
	role: string;
	username: string;
	token: string;
	installed: boolean;
	subscribed: boolean;
	[key: string]: any;
};
type State = 'active' | 'unactive';
export default class Client {
	private name = 'client';
	private version = 1;
	private connection!: DBOpenRequest<Scheme>;
	constructor(public options: { debug?: boolean } = {}) {}
	init(options?: { debug?: boolean }) {
		this.connection = open<Scheme>(this.name, this.version, {
			debug: options?.debug,
		});
		this.connection.options = Object.assign(this.options, options);
		this.connection.onUpgrade(async (db) => {
			const store = await db.create('user', { keyPath: 'username' });
			store.createIndex('state', 'state', { unique: false });
		});
		return this;
	}
	async set(data: Data) {
		const db = await this.connection;
		return db.write('user', async (store) => {
			const clients = await store.getAll();
			for (const client of clients) {
				client.state = 'unactive';
				store.put(client);
			}
			return store.put(data);
		});
	}
	async get() {
		const db = await this.connection;
		return db.read('user', (store) => {
			return store.index('state').get('active');
		});
	}
	async del() {
		const db = await this.connection;
		return db.write('user', async (store) => {
			const client = await this.get();
			if (client) {
				return store.delete(client.username);
			}
			return undefined;
		});
	}
	async clear() {
		const db = await this.connection;
		return db.write('user', (store) => {
			return store.clear();
		});
	}
}

interface SchemeLocal extends DBScheme {
	store: {
		local: {
			key: string;
			value: any;
		};
	};
	index: {
		key: string;
	};
}

export class LocalStorage {
	private name = 'local-storage';
	private version = 1;
	private connection!: DBOpenRequest<SchemeLocal>;
	constructor(public options: { debug?: boolean } = {}) {}
	init(options?: { debug?: boolean }) {
		Object.assign(this.options, options);
		this.connection = open<SchemeLocal>(this.name, this.version, {
			debug: this.options?.debug,
		});
		this.connection.onUpgrade(async (db) => {
			const store = await db.create('local', { keyPath: 'key' });
			store.createIndex('key', 'key', { unique: true, multiEntry: true });
		});
		return this;
	}
	async set<V = any>(key: string, value: V) {
		const db = await this.connection;
		return db.write('local', async (store) => {
			await store.put({ key, value });
		});
	}
	async get<V = any>(key: string) {
		const db = await this.connection;
		return db.read('local', async (store) => {
			const data = await store.index('key').get(key);
			return data?.value as V | undefined;
		});
	}
	async del(key: string) {
		const db = await this.connection;
		return db.write('local', async (store) => {
			await store.delete(key);
		});
	}
	async clear() {
		const db = await this.connection;
		return db.write('local', async (store) => {
			await store.clear();
		});
	}
}
