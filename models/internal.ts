import type {
	PrismaClient,
	Prisma,
	Internal,
	InternalHistory,
} from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['internal'];
type History = PrismaClient['internalHistory'];

export type Data = Internal;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.InternalFindUniqueArgs;
export type SearchQuery = Prisma.InternalFindFirstArgs;
export type SearchManyQuery = Prisma.InternalFindManyArgs;
export type CreateQuery = Prisma.InternalCreateArgs;
export type CreateManyQuery = Prisma.InternalCreateManyArgs;
export type UpdateQuery = Prisma.InternalUpdateArgs;
export type UpdateManyQuery = Prisma.InternalUpdateManyArgs;
export type UpsertQuery = Prisma.InternalUpsertArgs;
export type DeleteQuery = Prisma.InternalDeleteArgs;
export type DeleteManyQuery = Prisma.InternalDeleteManyArgs;
export type AggregateQuery = Prisma.InternalAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.InternalGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.InternalGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.InternalGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.InternalGetPayload<Query>> | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.InternalGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__InternalClient<Data>,
	Prisma.Prisma__InternalClient<Prisma.InternalGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__InternalClient<Data>,
	Prisma.Prisma__InternalClient<Prisma.InternalGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__InternalClient<Data>,
	Prisma.Prisma__InternalClient<Prisma.InternalGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__InternalClient<Data>,
	Prisma.Prisma__InternalClient<Prisma.InternalGetPayload<Query>>
>;
export type QueringAggregate<Query> = Prisma.GetInternalAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetInternalGroupByPayload<Query>;

type Method = Omit<
	InternalModel,
	| 'model'
	| 'history'
	| 'user'
	| 'transaction'
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

type Orm = Omit<PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">
type TransactionHandler<T = any> = (orm: Orm['internal']) => Promise<T>;

interface RecordParams {
	operation: Operation;
	query: object;
	result: Prisma.Prisma__InternalClient<Internal>;
}

import Api from 'utility/api';

export class InternalModel {
	public model: Model;
	public history: InternalHistoryModel;
	public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.internal;
		this.history = new InternalHistoryModel(orm);
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
				model: 'internal',
			});
		}
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
		this.record({ operation: 'create', query, result });
		return result;
	}
	public createMany<T extends CreateManyQuery>(query: T) {
		return this.model.createMany<T>(query as any);
	}
	public update<T extends UpdateQuery>(query: T) {
		const result = this.model.update<T>(query as any);
		this.record({ operation: 'update', query, result });
		return result;
	}
	public updateMany<T extends UpdateManyQuery>(query: T) {
		return this.model.updateMany<T>(query as any);
	}
	public upsert<T extends UpsertQuery>(query: T) {
		const result = this.model.upsert<T>(query as any);
		this.record({ operation: 'upsert', query, result });
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
	public group<T extends GroupQuery>(query: T) {
		return this.model.groupBy(query);
	}
	public batch(query: BatchQuery[]) {
		const funcs: { func: any; arg: any }[] = [];
		for (const patch of query) {
			for (const [name, arg] of Object.entries(patch) as [
				name: keyof InternalModel,
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
	public transaction<T = any>(handler: TransactionHandler<T>) {
		return this.orm.$transaction(async (orm) => handler(orm.internal));
	}
}

interface Params {
	id: number;
	data: object;
	query: object;
	user: UserInfo;
}

type Operation = 'create' | 'update' | 'upsert';
class InternalHistoryModel {
	public model: History;
	constructor(orm: PrismaClient) {
		this.model = orm.internalHistory;
	}
	protected upgrade(
		history: InternalHistory,
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
				internalId: id,
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
			.findUnique({ where: { internalId: id }, rejectOnNotFound: true })
			.then((history) => {
				return this.model.update({
					where: { id: history.id },
					data: this.upgrade(history, { id, data, query, user }) as any,
				});
			});
	}
	public upsert({ id, data, query, user }: Params) {
		return this.model
			.findUnique({ where: { internalId: id } })
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
	public delete({ id }: { id: number }) {
		return this.model.delete({ where: { internalId: id } });
	}
}
