import type ClientApi from '$lib/client-api';
import type Token from '$lib/token';
import type {
	Data,
	DataHistory,

	GetQuery,
	SearchQuery,
	CreateQuery,
	UpdateQuery,
	UpsertQuery,
	DeleteQuery,
	AggregateQuery,
	GroupQuery,
	BatchQuery,

	SearchManyQuery,
	CreateManyQuery,
	UpdateManyQuery,
	DeleteManyQuery,

	ValidateQuery,

	QueringGet,
	QueringSearch,
	QueringCreate,
	QueringUpdate,
	QueringUpsert,
	QueringDelete,
	QueringAggregate,
	QueringGroup,
	QueringBatch,

	QueringSearchMany,
	QueringCreateMany,
	QueringUpdateMany,
	QueringDeleteMany,
} from '$server/schemas/v0-alpha.1/ordered-item';
export type {
	Data,
	DataHistory,

	GetQuery,
	SearchQuery,
	CreateQuery,
	UpdateQuery,
	UpsertQuery,
	DeleteQuery,
	AggregateQuery,
	GroupQuery,
	BatchQuery,

	SearchManyQuery,
	CreateManyQuery,
	UpdateManyQuery,
	DeleteManyQuery,

	ValidateQuery,

	QueringGet,
	QueringSearch,
	QueringCreate,
	QueringUpdate,
	QueringUpsert,
	QueringDelete,
	QueringAggregate,
	QueringGroup,
	QueringBatch,

	QueringSearchMany,
	QueringCreateMany,
	QueringUpdateMany,
	QueringDeleteMany,
};
export default class OrderedItemClientApi {
	api: ClientApi;
	token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/ordered-item',
		});
		this.token = token.clone();
	}
	public init() {
		this.token.init();
	}
	protected async setToken(response: Response) {
		const token = response.headers.get('authorization')?.split(' ')[1];
		if (token) {
			this.token.store({ token });
		}
	}
	protected async getToken() {
		const data = await this.token.retrieve();
		return data?.token ?? '';
	}

	public async search<Query extends SearchQuery>(
		data: ValidateQuery<Query, SearchQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'search',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringSearch<Query>>();
		return response.read();
	}
	public async create<Query extends CreateQuery>(
		data: ValidateQuery<Query, CreateQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'create',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringCreate<Query>>();
		return response.read();
	}
	public async update<Query extends UpdateQuery>(
		data: ValidateQuery<Query, UpdateQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'update',
				method: 'PATCH',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringUpdate<Query>>();
		return response.read();
	}
	public async upsert<Query extends UpsertQuery>(
		data: ValidateQuery<Query, UpsertQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'upsert',
				method: 'PUT',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringUpsert<Query>>();
		return response.read();
	}
	public async delete<Query extends DeleteQuery>(
		data: ValidateQuery<Query, DeleteQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'delete',
				method: 'DELETE',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringDelete<Query>>();
		return response.read();
	}
	public async aggregate<Query extends AggregateQuery>(
		data: ValidateQuery<Query, AggregateQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'aggregate',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },

				body: data,
			})
			.send<QueringAggregate<Query>>();
		return response.read();
	}
	public async group<Query extends GroupQuery>(
		data: ValidateQuery<Query, GroupQuery>
	) {
		const response = await this.api
			.request<Query>({
				endpoint: 'group',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },

				body: data,
			})
			.send<QueringGroup<Query>>();
		return response.read();
	}
	public async batch<Query extends Array<BatchQuery>>(
		data: Query
	) {
		const response = await this.api
			.request({
				endpoint: 'batch',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringBatch<Query>>();
		return response.read();
	}

	public async searchMany<Query extends SearchManyQuery>(data: ValidateQuery<Query, SearchManyQuery>) {
		const response = await this.api
			.request<Query>({
				endpoint: 'searchMany',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringSearchMany<Query>>();
		return response.read();
	}
	public async createMany<Query extends CreateManyQuery>(data: ValidateQuery<Query, CreateManyQuery>) {
		const response = await this.api
			.request<Query>({
				endpoint: 'createMany',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringCreateMany<Query>>();
		return response.read();
	}
	public async updateMany<Query extends UpdateManyQuery>(data: ValidateQuery<Query, UpdateManyQuery>) {
		const response = await this.api
			.request<Query>({
				endpoint: 'updateMany',
				method: 'PATCH',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringUpdateMany<Query>>();
		return response.read();
	}
	public async deleteMany<Query extends DeleteManyQuery>(data: ValidateQuery<Query, DeleteManyQuery>) {
		const response = await this.api
			.request<Query>({
				endpoint: 'deleteMany',
				method: 'DELETE',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringDeleteMany<Query>>();
		return response.read();
	}
}
