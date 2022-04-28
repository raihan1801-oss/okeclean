import type { Multipart, MultipartFields } from 'fastify-multipart';

export type Env<E> = NodeJS.Process & {
	env: NodeJS.ProcessEnv &
		Required<E> & { PORT: string; HOME: string; EMIT: string };
};
export type ToBoolean<O> = O extends object
	? { [P in keyof O]: boolean }
	: never;
export type ToOptional<O, E = never> = O extends object
	? { [P in keyof O]: P extends E ? O[P] : O[P] | undefined }
	: never;
type a = Exclude;
export type ToRequired<O, E = never> = O extends object
	? { [P in keyof O]: NonNullable<O[P]> }
	: never;
export type InRequired<O, E = never> = O extends object
	? ToOptional<{ [P in keyof O]-?: O[P] }, E>
	: `Error: type must object`;
export type ToUnion<O> = O;
export type TupleToUnion<K extends readonly any[]> = K extends (infer E)[]
	? E
	: never;
export type ToObject<O> = O extends Array<infer I>
	? {
			[P in keyof I]: I[P][];
	  }
	: {
			[P in keyof O]: O[P];
	  };
export type Concate<O> = {
	[P in keyof O]: O[P];
};
export interface UserInfo {
	username: string;
	entity: string;
	role: string;
	time: Date;
	sub: number;
}
export type ResponseBody<> = {
	[key: string]: any;
};
export type ResponseBodyError = {
	message: string;
	stack: any;
	args: any;
};
export type ResponseBodyUpload<D = unknown> = {
	data: D;
};
export type WithJWT<D> = {
	user: D;
	token: string;
};
export type JWTPayload = {
	sub: number;
	role: string;
};
export type RequestBodyFile<O> = {
	[P in keyof O]: string;
};
export interface ToMultipart<O> extends Multipart {
	fields: O extends Array<infer I>
		? {
				[P in keyof I]: I[P] extends File ? Multipart[] : Multipart<I[P]>[];
		  }
		: {
				[P in keyof O]: O[P] extends File ? Multipart : Multipart<O[P]>;
		  };
}
export type ToDownload<O, K = any> = O extends Array<infer I>
	? {
			[P in keyof I]: I[P] extends File ? Stream : I[P];
	  }[]
	: {
			[P in keyof O]: O[P] extends File ? Stream : O[P];
	  };
export type User = 'customer' | 'cleaner' | 'admin' | 'buyer' | 'seller' | 'courier' | 'internal';
export type ServerSentEvent<M = any> = {
	tag: string;
	data: M;
};
export type WebSocketMessage<M = any> = {
	tag: string;
	data: M;
};
export interface WebPushPayload {
	tag: string;
	subscribers: string[];
	href: string;
	notifications: {
		tag: string;
		title: string;
		body: string;
		image?: string;
		badge?: string;
		icon?: string;
		renotify?: boolean;
	};
	[key: string]: any;
}
export interface WebPushResponse {
	state: string;
	message: string;
}
