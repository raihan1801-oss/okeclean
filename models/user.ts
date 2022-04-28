import type {
	ToBoolean,
	ToOptional,
	Concate,
	ToRequired,
	InRequired,
	UserInfo,
} from 'project/global';
import type {
	PrismaClient,
	Prisma,
	User,
} from '@prisma/client';

type Model = PrismaClient['user'];
// type History = PrismaClient['sellerHistory'];

export type Data = User;
// export type DataHistory = {
// 	query: object;
// 	data: object[];
// 	createAt: string;
// 	updateAt: string;
// 	createdBy: string;
// 	updatedBy: string;
// };
export type GetQuery = Prisma.UserFindUniqueArgs;
export type SearchQuery = Prisma.UserFindFirstArgs;
export type SearchManyQuery = Prisma.UserFindManyArgs;
export type CreateQuery = Prisma.UserCreateArgs;
export type CreateManyQuery = Prisma.UserCreateManyArgs;
export type UpdateQuery = Prisma.UserUpdateArgs;
export type UpdateManyQuery = Prisma.UserUpdateManyArgs;
export type UpsertQuery = Prisma.UserUpsertArgs;
export type DeleteQuery = Prisma.UserDeleteArgs;
export type DeleteManyQuery = Prisma.UserDeleteManyArgs;
export type AggregateQuery = Prisma.UserAggregateArgs;
export type GroupQuery = ToOptional<
	Required<Prisma.UserGroupByArgs>,
	'by' | 'orderBy'
>;
export type ValidateQuery<T, K> = Prisma.SelectSubset<T, K>;
type HasReject<Q> = Q extends { rejectOnNotFound: true } ? true : false;
export type QueringGet<Query extends object> = Prisma.CheckSelect<
	Query,
	Data,
	Prisma.UserGetPayload<Query>
>;
export type QueringSearch<Query extends object> = HasReject<Query> extends true
	? Prisma.CheckSelect<Query, Data, Prisma.UserGetPayload<Query>>
	: Prisma.CheckSelect<Query, Data, Prisma.UserGetPayload<Query>> | null;
export type QueringSearchMany<Query extends object> = Prisma.CheckSelect<
	Query,
	Array<Data>,
	Array<Prisma.UserGetPayload<Query>>
>;
export type QueringCreate<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__UserClient<Data>,
	Prisma.Prisma__UserClient<Prisma.UserGetPayload<Query>>
>;
export type QueringUpdate<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__UserClient<Data>,
	Prisma.Prisma__UserClient<Prisma.UserGetPayload<Query>>
>;
export type QueringDelete<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__UserClient<Data>,
	Prisma.Prisma__UserClient<Prisma.UserGetPayload<Query>>
>;
export type QueringUpsert<Query extends object> = Prisma.CheckSelect<
	Query,
	Prisma.Prisma__UserClient<Data>,
	Prisma.Prisma__UserClient<Prisma.UserGetPayload<Query>>
>;
export type QueringAggregate<Query extends object> = Prisma.GetUserAggregateType<Query>;
export type QueringGroup<Query extends GroupQuery> =
	Prisma.GetUserGroupByPayload<Query>;

type Method = Omit<
	UserModel,
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

import Api from 'utility/api';

export default class UserModel {
	public model: Model;
	// public history: UserHistoryModel;
	// public info?: UserInfo;
	constructor(protected orm: PrismaClient) {
		this.model = this.orm.user;
		// this.history = new UserHistoryModel(orm);
	}
	// public setInfo(info: UserInfo) {
	// 	this.info = info;
	// 	return this;
	// }
	// public unsetInfo() {
	// 	delete this.info;
	// 	return this;
	// }
	// protected async record({ operation, query, result }: RecordParams) {
	// 	const data = await result;
	// 	const user = this.info;
	// 	if (data.id && user) {
	// 		delete this.info;
	// 		return await this.history[operation]({ id: data.id, query, data, user });
	// 	} else {
	// 		throw Api.Error.Failed('undefined user or bad query', {
	// 			operation,
	// 			model: 'User',
	// 		});
	// 	}
	// }
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
		// this.record({ operation: 'create', query, result });
		return result;
	}
	public createMany(query: CreateManyQuery) {
		return this.model.createMany(query);
	}
	public update(query: UpdateQuery) {
		const result = this.model.update(query);
		// this.record({ operation: 'update', query, result });
		return result;
	}
	public updateMany(query: UpdateManyQuery) {
		return this.model.updateMany(query);
	}
	public upsert(query: UpsertQuery) {
		const result = this.model.upsert(query);
		// this.record({ operation: 'upsert', query, result });
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
				name: keyof UserModel,
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
