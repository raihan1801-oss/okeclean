import type ClientApi from '$lib/client-api';
import type Token from '$lib/token';
import type {
	Data,
	Stat,
	SentEvent,
	User,
	Slide,
	ProductData,
	OrderData,
	OrderDataDetail,
	Sale,
	Subs,
	SaleDetail,
	DirTree,
	DirFile
} from '$server/schemas/v0-alpha.1/admin';
export type {
	Data,
	Stat,
	SentEvent,
	User,
	Slide,
	ProductData,
	OrderData,
	OrderDataDetail,
	Sale,
	Subs,
	SaleDetail,
	DirTree,
	DirFile
};
export default class AdminClientApi {
	api: ClientApi;
	token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/admin'
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
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Data>();
		return response.read();
	}

	public async stat() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'stat',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Stat>();
		return response.read();
	}

	public async getModel() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'model',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Data['model']>();
		return response.read();
	}
	public async setModel(data: Data['model']) {
		const response = await this.api
			.request({
				method: 'PATCH',
				endpoint: 'model',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data
			})
			.send<Data['model']>();
		return response.read();
	}

	public async getBusiness() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'business',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Data['business']>();
		return response.read();
	}
	public async setBusiness(data: Data['business']) {
		const response = await this.api
			.request({
				method: 'PATCH',
				endpoint: 'business',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data
			})
			.send<Data['business']>();
		return response.read();
	}

	public async getSlide() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'slide',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Slide[]>();
		return response.read();
	}
	public async setSlide(data: Slide[], image: FormData) {
		const response = await this.api
			.request({
				method: 'PATCH',
				endpoint: 'slide',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data
			})
			.send<Slide[]>();
		const result = await response.read();
		await this.api
			.request({
				method: 'POST',
				endpoint: 'slide/image',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: image
			})
			.send<any>();
		return result;
	}

	public async user(role?: string, id?: number) {
		let endpoint = 'user';
		if (role && id) {
			endpoint += '/' + role + '-' + id;
		}
		const response = await this.api
			.request({
				method: 'GET',
				endpoint,
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<User>();
		return response.read();
	}
	public async users() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'user',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<User[]>();
		return response.read();
	}
	public async product(id: number) {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'product/' + id,
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<ProductData>();
		return response.read();
	}
	public async products() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'product',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<ProductData[]>();
		return response.read();
	}
	public async order(id: number) {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'order/' + id,
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<OrderDataDetail>();
		return response.read();
	}
	public async orders() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'order',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<OrderData[]>();
		return response.read();
	}

	public async sale(id: number) {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'sales/' + id,
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<SaleDetail>();
		return response.read();
	}
	public async sales() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'sales',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Sale[]>();
		return response.read();
	}

	public async subscribers() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'subscribers',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<Subs[]>();
		return response.read();
	}
	public async unsubscrib(id: number) {
		const response = await this.api
			.request({
				method: 'DELETE',
				endpoint: 'unsubscribe/' + id,
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: ''
			})
			.send<Subs>();
		return response.read();
	}

	public async folder() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'folder',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<DirTree>();
		return response.read();
	}
	public async folder_upload(file: Blob, path: string) {
		const response = await this.api
			.request({
				method: 'POST',
				endpoint: 'folder' + path,
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: file
			})
			.send<DirFile>();
		return response.read();
	}
	public async folder_create(path: string, name: string) {
		const response = await this.api
			.request({
				method: 'POST',
				endpoint: 'folder' + path + '/' + name,
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: ''
			})
			.send<DirTree | DirFile>();
		return response.read();
	}
	public async folder_remove(path: string) {
		const response = await this.api
			.request({
				method: 'DELETE',
				endpoint: 'folder' + path,
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: null
			})
			.send<boolean>();
		return response.read();
	}

	public get log() {
		return this.api.es({ endpoint: 'log', persist: true });
	}

	public async log_reset() {
		const response = await this.api
			.request({
				method: 'DELETE',
				endpoint: 'log',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: ''
			})
			.send<boolean>();
		return response.read();
	}
	public async log_download() {
		const response = await this.api
			.request({
				method: 'GET',
				endpoint: 'log',
				headers: { authorization: 'Bearer ' + (await this.getToken()) }
			})
			.send<unknown>();
		return response.raw;
	}

	public get event() {
		return this.api.es({ persist: true });
	}
}
