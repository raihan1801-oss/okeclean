import type ClientApi from '$lib/client-api';
import type Token from '$lib/token';
import type {
	Data,
	GetParam,
  GetAllByParam,
  CreateParam,
  AcceptParam,
  AssignParam,
  CancelParam,
  DeclineParam,
  FinishParam,
	TransactionData,
	DailyCleaningService,
	GetReturn,
} from '$server/schemas/v0-alpha.1/transaction';
export type {
	Data,
	GetParam,
  GetAllByParam,
  CreateParam,
  AcceptParam,
  AssignParam,
  CancelParam,
  DeclineParam,
  FinishParam,
	TransactionData,
	DailyCleaningService,
};
export default class InternalClientApi {
	public api: ClientApi;
	public token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/transaction',
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

  public async get(data: GetParam) {
		const response = await this.api
			.request<GetParam>({
				endpoint: 'get',
				method: 'POST',
        body: data,
			})
			.send<GetReturn>();
		return response.read();
	}
  public async get_all() {
		const response = await this.api
			.request({
				endpoint: 'get-all',
				method: 'GET',
			})
			.send<Data[]>();
		return response.read();
	}
	public async get_all_by(param: GetAllByParam) {
		const response = await this.api
			.request({
				endpoint: 'get-all-by',
				method: 'POST',
				body: param,
			})
			.send<Data[]>();
		return response.read();
	}
	public async create(data: CreateParam) {
		const response = await this.api
			.request<CreateParam>({
				endpoint: 'create',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		return response.read();
	}
	public async assign(data: AssignParam) {
		const response = await this.api
			.request<AssignParam>({
				endpoint: 'assign',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		return response.read();
	}
	public async cancel(data: CancelParam) {
		const response = await this.api
			.request<CancelParam>({
				endpoint: 'cancel',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		return response.read();
	}
	public async finish(data: FinishParam) {
		const response = await this.api
			.request<FinishParam>({
				endpoint: 'finish',
				method: 'POST',
				body: data,
			})
			.send<Data>();
		return response.read();
	}


	// public async search<Query extends SearchQuery>(
	// 	data: ValidateQuery<Query, SearchQuery>
	// ) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'search',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },

	// 			body: data,
	// 		})
	// 		.send<QueringSearch<Query>>();
	// 	return response.read();
	// }
	// public async update<Query extends UpdateQuery>(
	// 	data: ValidateQuery<Query, UpdateQuery>
	// ) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'update',
	// 			method: 'PATCH',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },

	// 			body: data,
	// 		})
	// 		.send<QueringUpdate<Query>>();
	// 	return response.read();
	// }
	// public async aggregate<Query extends AggregateQuery>(
	// 	data: ValidateQuery<Query, AggregateQuery>
	// ) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'aggregate',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },

	// 			body: data,
	// 		})
	// 		.send<QueringAggregate<Query>>();
	// 	return response.read();
	// }
	// public async group<Query extends GroupQuery>(
	// 	data: ValidateQuery<Query, GroupQuery>
	// ) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'group',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },

	// 			body: data,
	// 		})
	// 		.send<QueringGroup<Query>>();
	// 	return response.read();
	// }

	// public async searchMany<Query extends SearchManyQuery>(data: ValidateQuery<Query, SearchManyQuery>) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'searchMany',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },
	// 			body: data,
	// 		})
	// 		.send<QueringSearchMany<Query>>();
	// 	return response.read();
	// }
	// public async updateMany<Query extends UpdateManyQuery>(data: ValidateQuery<Query, UpdateManyQuery>) {
	// 	const response = await this.api
	// 		.request<Query>({
	// 			endpoint: 'updateMany',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },
	// 			body: data,
	// 		})
	// 		.send<QueringUpdateMany<Query>>();
	// 	return response.read();
	// }
	// public async batch<Query extends Array<BatchQuery>>(
	// 	data: Query
	// ) {
	// 	const response = await this.api
	// 		.request({
	// 			endpoint: 'batch',
	// 			method: 'POST',
	// 			headers: { authorization: 'Bearer ' + (await this.getToken()) },
	// 			body: data,
	// 		})
	// 		.send<QueringBatch<Query>>();
	// 	return response.read();
	// }

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
	public async removeImage(path: string) {
		const response = await this.api
			.request({
				endpoint: `image${path}`,
				method: 'DELETE',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: "",
			})
			.send<string>();
		return response.read();
	}
}
