import type { PrismaClient, Prisma, SelectedItem } from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['selectedItem'];
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
type Method = Omit<
	SelectedItemModel,
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

export type Data = SelectedItem;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.SelectedItemFindUniqueArgs;
export type SearchQuery = Prisma.SelectedItemFindFirstArgs;
export type SearchManyQuery = Prisma.SelectedItemFindManyArgs;
export type CreateQuery = Prisma.SelectedItemCreateArgs;
export type CreateManyQuery = Prisma.SelectedItemCreateManyArgs;
export type UpdateQuery = Prisma.SelectedItemUpdateArgs;
export type UpdateManyQuery = Prisma.SelectedItemUpdateManyArgs;
export type UpsertQuery = Prisma.SelectedItemUpsertArgs;
export type DeleteQuery = Prisma.SelectedItemDeleteArgs;
export type DeleteManyQuery = Prisma.SelectedItemDeleteManyArgs;
export type AggregateQuery = Prisma.SelectedItemAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.SelectedItemGroupByArgs>,
	'by' | 'orderBy'
>;
export type BatchQuery = BuildWithArg<Method>;

export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;

export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.SelectedItemGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.SelectedItemGetPayload<Query>>
	: Prisma.CheckSelect<
			Query,
			Data,
			Prisma.SelectedItemGetPayload<Query>
	  > | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.SelectedItemGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SelectedItemClient<Data>,
	Prisma.Prisma__SelectedItemClient<Prisma.SelectedItemGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SelectedItemClient<Data>,
	Prisma.Prisma__SelectedItemClient<Prisma.SelectedItemGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SelectedItemClient<Data>,
	Prisma.Prisma__SelectedItemClient<Prisma.SelectedItemGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__SelectedItemClient<Data>,
	Prisma.Prisma__SelectedItemClient<Prisma.SelectedItemGetPayload<Query>>
>;
export type QueringAggregate<Query> =
	Prisma.GetSelectedItemAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetSelectedItemGroupByPayload<Query>;
export type QueringBatch<A> = BuildWithReturn<A>;

export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

export class SelectedItemModel {
	public model: Model;
	public user?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.selectedItem;
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
				name: keyof SelectedItemModel,
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
