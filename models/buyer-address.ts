import type { PrismaClient, Prisma, BuyerAddress } from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['buyerAddress'];

export type Data = BuyerAddress;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.BuyerAddressFindUniqueArgs;
export type SearchQuery = Prisma.BuyerAddressFindFirstArgs;
export type SearchManyQuery = Prisma.BuyerAddressFindManyArgs;
export type CreateQuery = Prisma.BuyerAddressCreateArgs;
export type CreateManyQuery = Prisma.BuyerAddressCreateManyArgs;
export type UpdateQuery = Prisma.BuyerAddressUpdateArgs;
export type UpdateManyQuery = Prisma.BuyerAddressUpdateManyArgs;
export type UpsertQuery = Prisma.BuyerAddressUpsertArgs;
export type DeleteQuery = Prisma.BuyerAddressDeleteArgs;
export type DeleteManyQuery = Prisma.BuyerAddressDeleteManyArgs;
export type AggregateQuery = Prisma.BuyerAddressAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.BuyerAddressGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.BuyerAddressGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.BuyerAddressGetPayload<Query>>
	: Prisma.CheckSelect<
			Query,
			Data,
			Prisma.BuyerAddressGetPayload<Query>
	  > | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.BuyerAddressGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__BuyerAddressClient<Data>,
	Prisma.Prisma__BuyerAddressClient<Prisma.BuyerAddressGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__BuyerAddressClient<Data>,
	Prisma.Prisma__BuyerAddressClient<Prisma.BuyerAddressGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__BuyerAddressClient<Data>,
	Prisma.Prisma__BuyerAddressClient<Prisma.BuyerAddressGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__BuyerAddressClient<Data>,
	Prisma.Prisma__BuyerAddressClient<Prisma.BuyerAddressGetPayload<Query>>
>;
export type QueringAggregate<Query> =
	Prisma.GetBuyerAddressAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetBuyerAddressGroupByPayload<Query>;
export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

type Method = Omit<
	BuyerAddressModel,
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
// type BuildWithReturn<A> = {
// 	[I in keyof A]: {
// 		[P in keyof A[I]]: P extends keyof Method
// 			? Method[P] extends (arg: infer A) => infer R
// 				? R extends Promise<infer T>
// 					? [T]
// 					: never
// 				: never
// 			: never;
// 	};
// };
type BuildWithReturn<A> = {
	[I in keyof A]: keyof A[I] extends keyof Method
		? Method[keyof A[I]] extends (arg: infer A) => infer R
			? R extends Promise<infer T>
				? T
				: never
			: never
		: never;
};
export type BatchQuery = BuildWithArg<Method>;
export type QueringBatch<A> = BuildWithReturn<A>;

export class BuyerAddressModel {
	public model: Model;
	public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.buyerAddress;
	}
	public setInfo(info: UserInfo) {
		this.info = info;
		return this;
	}
	public unsetInfo() {
		delete this.info;
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
	public async group(query: GroupQuery) {
		return this.model.groupBy(query);
	}
	public batch(query: BatchQuery[]) {
		const funcs: { func: any; arg: any }[] = [];
		for (const patch of query) {
			for (const [name, arg] of Object.entries(patch) as [
				name: keyof BuyerAddressModel,
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
