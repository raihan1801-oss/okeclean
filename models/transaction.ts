import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
} from 'project/global';
import type {
	PrismaClient,
	Prisma,
	Transaction,
} from '@prisma/client';

type Model = PrismaClient['transaction'];

export type Data = Transaction;
export type GetQuery = Prisma.TransactionFindUniqueArgs;
export type SearchQuery = Prisma.TransactionFindFirstArgs;
export type SearchManyQuery = Prisma.TransactionFindManyArgs;
export type CreateQuery = Prisma.TransactionCreateArgs;
export type CreateManyQuery = Prisma.TransactionCreateManyArgs;
export type UpdateQuery = Prisma.TransactionUpdateArgs;
export type UpdateManyQuery = Prisma.TransactionUpdateManyArgs;
export type UpsertQuery = Prisma.TransactionUpsertArgs;
export type DeleteQuery = Prisma.TransactionDeleteArgs;
export type DeleteManyQuery = Prisma.TransactionDeleteManyArgs;
export type AggregateQuery = Prisma.TransactionAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.TransactionGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query extends object> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.TransactionGetPayload<Query>
>;
export type QueringSearch<Query extends object> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.TransactionGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.TransactionGetPayload<Query>> | null;
export type QueringSearchMany<Query extends object> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.TransactionGetPayload<Query>>
>;
export type QueringCreate<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__TransactionClient<Data>,
	Prisma.Prisma__TransactionClient<Prisma.TransactionGetPayload<Query>>
>;
export type QueringUpdate<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__TransactionClient<Data>,
	Prisma.Prisma__TransactionClient<Prisma.TransactionGetPayload<Query>>
>;
export type QueringDelete<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__TransactionClient<Data>,
	Prisma.Prisma__TransactionClient<Prisma.TransactionGetPayload<Query>>
>;
export type QueringUpsert<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__TransactionClient<Data>,
	Prisma.Prisma__TransactionClient<Prisma.TransactionGetPayload<Query>>
>;
export type QueringAggregate<Query extends object> = Prisma.GetTransactionAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetTransactionGroupByPayload<Query>;

type Method = Omit<
	TransactionModel,
	| 'model'
	| 'Transaction'
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
export type BatchQuery = BuildWithArg<Method>;
export type QueringBatch<A> = BuildWithReturn<A>;
export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

export default class TransactionModel {
	public model: Model;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.transaction;
	}
	public get(query: GetQuery) {
		return this.model.findUnique(query);
	}
	public search(query?: SearchQuery) {
		return this.model.findFirst(query);
	}
	public searchMany(query?: SearchManyQuery) {
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
				name: keyof TransactionModel,
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
