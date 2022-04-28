import type ClientApi from '$lib/client-api';
import type Token from '$lib/token';
import type {
	RegisterData,
	UnregisterData,
	LoginData,
	ChangePasswordData,

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
} from '$server/schemas/v0-alpha.1/seller';
export type {
	RegisterData,
	UnregisterData,
	LoginData,
	ChangePasswordData,

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
export default class SellerClientApi {
	api: ClientApi;
	token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/seller',
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

	public async register(data: RegisterData) {
		const response = await this.api
			.request<RegisterData>({
				endpoint: 'register',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		await this.setToken(response.raw);
		return response.read();
	}
	public async unregister(data: UnregisterData) {
		const response = await this.api
			.request<UnregisterData>({
				endpoint: 'unregister',
				method: 'DELETE',
				body: data,
			})
			.send<unknown>();
		await this.token.remove();
		return response.read();
	}
	public async login(data: LoginData) {
		const response = await this.api
			.request<LoginData>({
				endpoint: 'login',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		await this.setToken(response.raw);
		return response.read();
	}
	public async changePassword(data: ChangePasswordData) {
		const response = await this.api
			.request<ChangePasswordData>({
				endpoint: 'password',
				method: 'PATCH',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<Data>();
		return response.read();
	}
	public async auth() {
		const response = await this.api
			.request({
				endpoint: 'auth',
				method: 'GET',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
			})
			.send<Data>();
		return response.read();
	}
	public async generateOtp() {}
	public async verifyOtp() {}

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
	public async updateMany<Query extends UpdateManyQuery>(data: ValidateQuery<Query, UpdateManyQuery>) {
		const response = await this.api
			.request<Query>({
				endpoint: 'updateMany',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<QueringUpdateMany<Query>>();
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

	public async downloadImage<Body extends File | Blob>(path: string) {
		const response = await this.api
			.request<Body>({
				endpoint: `image/${path}`,
				method: 'GET',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
			})
			.send<Blob>();
		return response.read();
	}
	public async uploadImage<Body extends File>(path: string, data: Body) {
		const response = await this.api
			.request<Body>({
				endpoint: `image/${path}`,
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },

				body: data,
			})
			.send<string>();
		return response.read();
	}
}
