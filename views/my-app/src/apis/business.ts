import type ClientApi from '$lib/client-api';
import type Token from '$lib/token';
import type {
	Data,
	CheckoutData,
	OrderData,
} from '$server/schemas/v0-alpha.1/business';
export type {
	Data,
	CheckoutData,
	OrderData,
};
export default class AddressClientApi {
	api: ClientApi;
	token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/business',
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

	public async get() {
		const response = await this.api
			.request({
				method: 'GET',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
			})
			.send<Data>();
		return response.read();
	}

	public async slide() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'slide',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
			})
			.send<string[]>();
		return response.read();
	}

	public async order(data: OrderData) {
		const response = await this.api
			.request<OrderData>({
				endpoint: 'order',
				method: 'POST',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<unknown>();
		return response.read();
	}
}
