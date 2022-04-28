import { open } from './db';
import { hash } from './helper';

import type { DBOpenRequest, DBScheme } from './db';
import type { User } from '$server/global.d';

interface Scheme extends DBScheme {
	store: {
		user: {
			role: User;
			token: string;
		};
	};
	index: {
		role: User;
	};
}
type Data = Omit<Scheme['store']['user'], 'role'>;
export { User }
export default class Token {
	private version = '0.1.0';
	private connection!: DBOpenRequest<Scheme>;
	constructor(public role: User, public options?: { debug: boolean }) { }
	clone(role?: User, options?: { debug: boolean }) {
		return new Token(role ?? this.role, options ?? this.options);
	}
	init() {
		this.connection = open<Scheme>(hash(this.version), 1);
		this.connection.options = this.options;
		this.connection.onUpgrade(async (db) => {
			const store = await db.create('user', { keyPath: 'role' });
			store.createIndex('role', 'role', { unique: false });
		});
		return this;
	}
	async store(data: Data) {
		const db = await this.connection;
		return db.write('user', (store) => {
			return store.put({
				...data,
				role: this.role,
			});
		});
	}
	async retrieve() {
		const db = await this.connection;
		return db.read('user', (store) => {
			return store.index('role').get(this.role);
		});
	}
	async remove() {
		const db = await this.connection;
		return db.write('user', (store) => {
			return store.delete(this.role);
		});
	}
	async clear() {
		const db = await this.connection;
		return db.write('user', (store) => {
			return store.clear();
		})
	}
}
