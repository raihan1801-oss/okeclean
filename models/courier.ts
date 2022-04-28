import type {
	PrismaClient,
	Prisma,
	Courier,
	CourierHistory,
} from '@prisma/client';
import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';

type Model = PrismaClient['courier'];
type History = PrismaClient['courierHistory'];

export type Data = Courier;
export type DataHistory = {
	query: object;
	data: object[];
	createAt: string;
	updateAt: string;
	createdBy: string;
	updatedBy: string;
};
export type GetQuery = Prisma.CourierFindUniqueArgs;
export type SearchQuery = Prisma.CourierFindFirstArgs;
export type SearchManyQuery = Prisma.CourierFindManyArgs;
export type CreateQuery = Prisma.CourierCreateArgs;
export type CreateManyQuery = Prisma.CourierCreateManyArgs;
export type UpdateQuery = Prisma.CourierUpdateArgs;
export type UpdateManyQuery = Prisma.CourierUpdateManyArgs;
export type UpsertQuery = Prisma.CourierUpsertArgs;
export type DeleteQuery = Prisma.CourierDeleteArgs;
export type DeleteManyQuery = Prisma.CourierDeleteManyArgs;
export type AggregateQuery = Prisma.CourierAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.CourierGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.CourierGetPayload<Query>
>;
export type QueringSearch<Query> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.CourierGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.CourierGetPayload<Query>> | null;
export type QueringSearchMany<Query> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.CourierGetPayload<Query>>
>;
export type QueringCreate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__CourierClient<Data>,
	Prisma.Prisma__CourierClient<Prisma.CourierGetPayload<Query>>
>;
export type QueringUpdate<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__CourierClient<Data>,
	Prisma.Prisma__CourierClient<Prisma.CourierGetPayload<Query>>
>;
export type QueringDelete<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__CourierClient<Data>,
	Prisma.Prisma__CourierClient<Prisma.CourierGetPayload<Query>>
>;
export type QueringUpsert<Query> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__CourierClient<Data>,
	Prisma.Prisma__CourierClient<Prisma.CourierGetPayload<Query>>
>;
export type QueringAggregate<Query> = Prisma.GetCourierAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetCourierGroupByPayload<Query>;

type Method = Omit<
	CourierModel,
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
	result: Prisma.Prisma__CourierClient<Courier>;
}

import Api from 'utility/api';

export class CourierModel {
	public model: Model;
	public history: CourierHistoryModel;
	public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.courier;
		this.history = new CourierHistoryModel(orm);
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
				model: 'courier',
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
				name: keyof CourierModel,
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
class CourierHistoryModel {
	public model: History;
	constructor(orm: PrismaClient) {
		this.model = orm.courierHistory;
	}
	protected upgrade(
		history: CourierHistory,
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
				courierId: id,
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
			.findUnique({ where: { courierId: id }, rejectOnNotFound: true })
			.then((history) => {
				return this.model.update({
					where: { id: history.id },
					data: this.upgrade(history, { id, data, query, user }) as any,
				});
			});
	}
	public upsert({ id, data, query, user }: Params) {
		return this.model
			.findUnique({ where: { courierId: id } })
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
		return this.model.delete({ where: { courierId: id } });
	}
}
