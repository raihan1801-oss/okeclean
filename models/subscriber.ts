import type { PrismaClient, Prisma, Subscriber } from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['subscriber'];
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
type Method = Omit<
	SubscriberModel,
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

export type Data = Subscriber;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.SubscriberFindUniqueArgs;
export type SearchQuery = Prisma.SubscriberFindFirstArgs;
export type SearchManyQuery = Prisma.SubscriberFindManyArgs;
export type CreateQuery = Prisma.SubscriberCreateArgs;
export type CreateManyQuery = Prisma.SubscriberCreateManyArgs;
export type UpdateQuery = Prisma.SubscriberUpdateArgs;
export type UpdateManyQuery = Prisma.SubscriberUpdateManyArgs;
export type UpsertQuery = Prisma.SubscriberUpsertArgs;
export type DeleteQuery = Prisma.SubscriberDeleteArgs;
export type DeleteManyQuery = Prisma.SubscriberDeleteManyArgs;
export type AggregateQuery = Prisma.SubscriberAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.SubscriberGroupByArgs>,
	'by' | 'orderBy'
>;
export type BatchQuery = BuildWithArg<Method>;

export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;

export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.SubscriberGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.SubscriberGetPayload<Query>>
	: Prisma.CheckSelect<
			Query,
			Data,
			Prisma.SubscriberGetPayload<Query>
	  > | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.SubscriberGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SubscriberClient<Data>,
	Prisma.Prisma__SubscriberClient<Prisma.SubscriberGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SubscriberClient<Data>,
	Prisma.Prisma__SubscriberClient<Prisma.SubscriberGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SubscriberClient<Data>,
	Prisma.Prisma__SubscriberClient<Prisma.SubscriberGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SubscriberClient<Data>,
	Prisma.Prisma__SubscriberClient<Prisma.SubscriberGetPayload<Query>>
>;
export type QueringAggregate<Query> =
	Prisma.GetSubscriberAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetSubscriberGroupByPayload<Query>;
export type QueringBatch<A> = BuildWithReturn<A>;

export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

export class SubscriberModel {
	public model: Model;
	public user?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.subscriber;
	}
	public setUser(info: UserInfo) {
		this.user = info;
		return this;
	}
	public unsetUser() {
		delete this.user;
		return this;
	}
	public get<T extends GetQuery>(query: T) {
		return this.model.findUnique<T>(query as any);
	}
	public search<T extends SearchQuery>(query: T) {
		return this.model.findFirst<T>(query as any);
	}
	public searchMany<T extends SearchManyQuery>(query: T) {
		return this.model.findMany<T>(query as any);
	}
	public create<T extends CreateQuery>(query: T) {
		const result = this.model.create<T>(query as any);
		return result;
	}
	public createMany<T extends CreateManyQuery>(query: T) {
		return this.model.createMany<T>(query as any);
	}
	public update<T extends UpdateQuery>(query: T) {
		const result = this.model.update<T>(query as any);
		return result;
	}
	public updateMany<T extends UpdateManyQuery>(query: T) {
		return this.model.updateMany<T>(query as any);
	}
	public upsert<T extends UpsertQuery>(query: T) {
		const result = this.model.upsert<T>(query as any);
		return result;
	}
	public delete<T extends DeleteQuery>(query: T) {
		return this.model.delete<T>(query as any);
	}
	public deleteMany<T extends DeleteManyQuery>(query: T) {
		return this.model.deleteMany<T>(query as any);
	}
	public aggrerate<T extends AggregateQuery>(query: T) {
		return this.model.aggregate<T>(query as any);
	}
	public group(query: GroupQuery) {
		return this.model.groupBy(query);
	}
	public batch(query: BatchQuery[]) {
		const funcs: { func: any; arg: any }[] = [];
		for (const patch of query) {
			for (const [name, arg] of Object.entries(patch) as [
				name: keyof SubscriberModel,
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
