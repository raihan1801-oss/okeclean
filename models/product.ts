import type {
	PrismaClient,
	Prisma,
	Product,
	ProductHistory,
} from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['product'];
type History = PrismaClient['productHistory'];

export type Data = Product;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.ProductFindUniqueArgs;
export type SearchQuery = Prisma.ProductFindFirstArgs;
export type SearchManyQuery = Prisma.ProductFindManyArgs;
export type CreateQuery = Prisma.ProductCreateArgs;
export type CreateManyQuery = Prisma.ProductCreateManyArgs;
export type UpdateQuery = Prisma.ProductUpdateArgs;
export type UpdateManyQuery = Prisma.ProductUpdateManyArgs;
export type UpsertQuery = Prisma.ProductUpsertArgs;
export type DeleteQuery = Prisma.ProductDeleteArgs;
export type DeleteManyQuery = Prisma.ProductDeleteManyArgs;
export type AggregateQuery = Prisma.ProductAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.ProductGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.ProductGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.ProductGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.ProductGetPayload<Query>> | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.ProductGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ProductClient<Data>,
	Prisma.Prisma__ProductClient<Prisma.ProductGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ProductClient<Data>,
	Prisma.Prisma__ProductClient<Prisma.ProductGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ProductClient<Data>,
	Prisma.Prisma__ProductClient<Prisma.ProductGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__ProductClient<Data>,
	Prisma.Prisma__ProductClient<Prisma.ProductGetPayload<Query>>
>;
export type QueringAggregate<Query> = Prisma.GetProductAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetProductGroupByPayload<Query>;

type Method = Omit<
	ProductModel,
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
export type BatchQuery = BuildWithArg<Method>;
export type QueringBatch<A> = BuildWithReturn<A>;
export type QueringCreateMany<Query> = Prisma.BatchPayload;
export type QueringUpdateMany<Query> = Prisma.BatchPayload;
export type QueringDeleteMany<Query> = Prisma.BatchPayload;

interface RecordParams {
	operation: Operation;
	query: object;
	result: Prisma.Prisma__ProductClient<Product>;
}

import Api from 'utility/api';

export class ProductModel {
	public model: Model;
	public history: ProductHistoryModel;
	public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.product;
		this.history = new ProductHistoryModel(orm);
	}
	public setInfo(info: UserInfo) {
		this.info = info;
		return this;
	}
	public unsetInfo() {
		delete this.info;
		return this;
	}
	protected async record({ operation, query, result }: RecordParams) {
		const data = await result;
		const user = this.info;
		if (data.id && user) {
			delete this.info;
			return await this.history[operation]({ id: data.id, query, data, user });
		} else {
			throw Api.Error.Failed('undefined user or bad query', {
				operation,
				model: 'product',
			});
		}
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
		this.record({ operation: 'create', query, result });
		return result;
	}
	public createMany(query: CreateManyQuery) {
		return this.model.createMany(query);
	}
	public update(query: UpdateQuery) {
		const result = this.model.update(query);
		this.record({ operation: 'update', query, result });
		return result;
	}
	public updateMany(query: UpdateManyQuery) {
		return this.model.updateMany(query);
	}
	public upsert(query: UpsertQuery) {
		const result = this.model.upsert(query);
		this.record({ operation: 'upsert', query, result });
		return result;
	}
	public delete(query: DeleteQuery) {
		const result = this.model.delete(query);
		result.then(() => this.history.delete({ id: query.where.id }));
		return result;
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
				name: keyof ProductModel,
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

interface Params {
	id: number;
	data: object;
	query: object;
	user: UserInfo;
}

type Operation = 'create' | 'update' | 'upsert';
class ProductHistoryModel {
	public model: History;
	constructor(orm: PrismaClient) {
		this.model = orm.productHistory;
	}
	protected upgrade(
		history: ProductHistory,
		{ id, data, query, user }: Params
	) {
		const record = history.data as any[];
		const prevItem = record[record.length - 1];
		record.push({
			query,
			data,
			createAt: prevItem.createAt,
			updateAt: user.time,
			createdBy: prevItem.createdBy,
			updatedBy: user.username,
		});
		return history;
	}
	public create({ id, data, query, user }: Params) {
		return this.model.create({
			data: {
				productId: id,
				data: [
					{
						query: query as any,
						data: data as any,
						createAt: user.time as any,
						updateAt: user.time as any,
						createdBy: user.username,
						updatedBy: user.username,
					},
				],
			},
		});
	}
	public update({ id, data, query, user }: Params) {
		return this.model
			.findUnique({ where: { productId: id }, rejectOnNotFound: true })
			.then((history) => {
				return this.model.update({
					where: { id: history.id },
					data: this.upgrade(history, { id, data, query, user }) as any,
				});
			});
	}
	public upsert({ id, data, query, user }: Params) {
		return this.model
			.findUnique({ where: { productId: id } })
			.then((history) => {
				if (history) {
					return this.model.update({
						where: { id: history.id },
						data: this.upgrade(history, { id, data, query, user }) as any,
					});
				} else {
					return this.create({ id, data, query, user });
				}
			});
	}
	public delete({ id }: { id?: number }) {
		return this.model.delete({ where: { productId: id } });
	}
}
