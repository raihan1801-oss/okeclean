import type { PrismaClient, Prisma, ChatMessage } from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['chatMessage'];
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
type Method = Omit<
	ChatMessageModel,
	| 'model'
	| 'history'
	| 'user'
	| 'batch'
	| 'orm'
	| 'info'
	| 'setInfo'
	| 'unsetInfo'
>;
type BuildWithArg<O> = {
	[P in keyof O]?: O[P] extends (arg: infer A) => infer R ? A : never;
};
type BuildWithReturn<A> = {
	[I in keyof A]: keyof A[I] extends keyof Method
		? Method[keyof A[I]] extends (arg: infer A) => infer R
			? R extends Promise<infer T>
				? T
				: never
			: never
		: never;
};

export type Data = ChatMessage;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.ChatMessageFindUniqueArgs;
export type SearchQuery = Prisma.ChatMessageFindFirstArgs;
export type SearchManyQuery = Prisma.ChatMessageFindManyArgs;
export type CreateQuery = Prisma.ChatMessageCreateArgs;
export type CreateManyQuery = Prisma.ChatMessageCreateManyArgs;
export type UpdateQuery = Prisma.ChatMessageUpdateArgs;
export type UpdateManyQuery = Prisma.ChatMessageUpdateManyArgs;
export type UpsertQuery = Prisma.ChatMessageUpsertArgs;
export type DeleteQuery = Prisma.ChatMessageDeleteArgs;
export type DeleteManyQuery = Prisma.ChatMessageDeleteManyArgs;
export type AggregateQuery = Prisma.ChatMessageAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.ChatMessageGroupByArgs>,
	'by' | 'orderBy'
>;
export type BatchQuery = BuildWithArg<Method>;

export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;

export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.ChatMessageGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.ChatMessageGetPayload<Query>>
	: Prisma.CheckSelect<
			Query,
			Data,
			Prisma.ChatMessageGetPayload<Query>
	  > | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.ChatMessageGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ChatMessageClient<Data>,
	Prisma.Prisma__ChatMessageClient<Prisma.ChatMessageGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ChatMessageClient<Data>,
	Prisma.Prisma__ChatMessageClient<Prisma.ChatMessageGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ChatMessageClient<Data>,
	Prisma.Prisma__ChatMessageClient<Prisma.ChatMessageGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ChatMessageClient<Data>,
	Prisma.Prisma__ChatMessageClient<Prisma.ChatMessageGetPayload<Query>>
>;
export type QueringAggregate<Query> =
	Prisma.GetChatMessageAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetChatMessageGroupByPayload<Query>;
export type QueringBatch<A> = BuildWithReturn<A>;

export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

export class ChatMessageModel {
	public model: Model;
	public user?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.chatMessage;
	}
	public setUser(info: UserInfo) {
		this.user = info;
		return this;
	}
	public unsetUser() {
		delete this.user;
		return this;
	}
	public get(query: GetQuery) {
		return this.model.findUnique(query);
	}
	public search(query: SearchQuery) {
		return this.model.findFirst(query);
	}
	public searchMany(query: SearchManyQuery) {
		return this.model.findMany(query);
	}
	public create(query: CreateQuery) {
		const result = this.model.create(query);
		return result;
	}
	public createMany(query: CreateManyQuery) {
		return this.model.createMany(query);
	}
	public update(query: UpdateQuery) {
		const result = this.model.update(query);
		return result;
	}
	public updateMany(query: UpdateManyQuery) {
		return this.model.updateMany(query);
	}
	public upsert(query: UpsertQuery) {
		const result = this.model.upsert(query);
		return result;
	}
	public delete(query: DeleteQuery) {
		return this.model.delete(query);
	}
	public deleteMany(query: DeleteManyQuery) {
		return this.model.deleteMany(query);
	}
	public aggrerate(query: AggregateQuery) {
		return this.model.aggregate(query);
	}
	public group(query: GroupQuery) {
		return this.model.groupBy(query);
	}
	public batch(query: BatchQuery[]) {
		const funcs: { func: any; arg: any }[] = [];
		for (const patch of query) {
			for (const [name, arg] of Object.entries(patch) as [
				name: keyof ChatMessageModel,
				arg: any
			][]) {
				const func = this[name];
				if (typeof func == 'function' && typeof arg == 'object') {
					funcs.push({ func: func.bind(this), arg });
				}
			}
		}
		const task: any[] = [];
		for (const exec of funcs) {
			task.push(exec.func(exec.arg));
		}
		return this.orm.$transaction(task);
	}
}
