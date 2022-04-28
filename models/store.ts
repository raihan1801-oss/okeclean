import type { PrismaClient, Prisma, Store, StoreHistory } from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['store'];
type History = PrismaClient['storeHistory'];

export type Data = Store;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.StoreFindUniqueArgs;
export type SearchQuery = Prisma.StoreFindFirstArgs;
export type SearchManyQuery = Prisma.StoreFindManyArgs;
export type CreateQuery = Prisma.StoreCreateArgs;
export type CreateManyQuery = Prisma.StoreCreateManyArgs;
export type UpdateQuery = Prisma.StoreUpdateArgs;
export type UpdateManyQuery = Prisma.StoreUpdateManyArgs;
export type UpsertQuery = Prisma.StoreUpsertArgs;
export type DeleteQuery = Prisma.StoreDeleteArgs;
export type DeleteManyQuery = Prisma.StoreDeleteManyArgs;
export type AggregateQuery = Prisma.StoreAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.StoreGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.StoreGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.StoreGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.StoreGetPayload<Query>> | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.StoreGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__StoreClient<Data>,
	Prisma.Prisma__StoreClient<Prisma.StoreGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__StoreClient<Data>,
	Prisma.Prisma__StoreClient<Prisma.StoreGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__StoreClient<Data>,
	Prisma.Prisma__StoreClient<Prisma.StoreGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__StoreClient<Data>,
	Prisma.Prisma__StoreClient<Prisma.StoreGetPayload<Query>>
>;
export type QueringAggregate<Query> = Prisma.GetStoreAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetStoreGroupByPayload<Query>;

type Method = Omit<
	StoreModel,
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
	result: Prisma.Prisma__StoreClient<Store>;
}

import Api from 'utility/api';

export class StoreModel {
	public model: Model;
	public history: StoreHistoryModel;
	public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.store;
		this.history = new StoreHistoryModel(orm);
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
				model: 'store',
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
				name: keyof StoreModel,
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
class StoreHistoryModel {
	public model: History;
	constructor(orm: PrismaClient) {
		this.model = orm.storeHistory;
	}
	protected upgrade(history: StoreHistory, { id, data, query, user }: Params) {
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
				storeId: id,
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
			.findUnique({ where: { storeId: id }, rejectOnNotFound: true })
			.then((history) => {
				return this.model.update({
					where: { id: history.id },
					data: this.upgrade(history, { id, data, query, user }) as any,
				});
			});
	}
	public upsert({ id, data, query, user }: Params) {
		return this.model.findUnique({ where: { storeId: id } }).then((history) => {
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
	public delete({ id }: { id: number }) {
		return this.model.delete({ where: { storeId: id } });
	}
}
