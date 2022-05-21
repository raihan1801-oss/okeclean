import type ClientApi from '$lib/client-api';
import type { ClientWebSocket } from '$lib/client-api';
import type Token from '$lib/token';
import type {
	Channel,
	ChatChannel,
	ChatMessage,
	ChatNode,
	ConnectContact,
	CreateContact,
	GetChannel as GetContacts,
	ChatReceiveFormat,
	ChatSendFormat,
	Message,
	// SendMessage,
} from '$server/schemas/v0-alpha.1/chat';
export type {
	Channel,
	ChatChannel,
	ChatMessage,
	ChatNode,
	ConnectContact,
	CreateContact,
	GetContacts,
	ChatReceiveFormat,
	ChatSendFormat,
	Message,
	// SendMessage,
};
export type Contact = ChatNode.Data;
export default class ChatClientApi {
	api: ClientApi;
	token: Token;
	constructor(clientApi: ClientApi, token: Token) {
		this.api = clientApi.clone({
			path: '/chat',
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

	public async createContact(data: CreateContact) {
		const response = await this.api
			.request({
				method: 'POST',
				endpoint: 'create',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<Contact>();
		return response.read();
	}
	public async connectContact(data: ConnectContact) {
		const response = await this.api
			.request({
				method: 'POST',
				endpoint: 'connect',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<ChatChannel.Data>();
		return response.read();
	}
	public async getChannels(data: GetContacts) {
		const response = await this.api
			.request({
				method: 'POST',
				endpoint: 'channel',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<Channel[]>();
		return response.read();
	}
	public async message<Query extends ChatMessage.CreateQuery>(
		data: ChatMessage.ValidateQuery<Query, ChatMessage.CreateQuery>
	) {
		const response = await this.api
			.request<Query>({
				method: 'POST',
				endpoint: 'message',
				headers: { authorization: 'Bearer ' + (await this.getToken()) },
				body: data,
			})
			.send<void>();
		return response.read();
	}

	public ws() {
		return new WSChat(this.api.ws());
	}
	public get ws_v2() {
		return this.api.ws({persist: true});
	}
}

class WSChat {
	private static clientWS: ClientWebSocket;
	private clientWS: ClientWebSocket;
	constructor(cws: ClientWebSocket) {
		if (!WSChat.clientWS) {
			WSChat.clientWS = cws;
		} else {
			cws.close();
		}
		this.clientWS = WSChat.clientWS;
	}
	public async connect(node: { id: number; channel: Channel[] }) {
		await this.clientWS.opened;

		this.clientWS.send(
			"connect",
			this.serialize<ChatSendFormat>({
				tag: 'connect',
				data: node,
			})
		);
	}
	public async onMessage(
		handler: (
			message: ChatMessage.Data & {
				sentBy: ChatNode.Data;
				replyFor: ChatMessage.Data | null;
			}
		) => any
	) {
		await this.clientWS.opened;
		const listener = (event: MessageEvent) => {
			const message = this.deserialize<ChatReceiveFormat>(event.data);
			if (message.tag == 'message') {
				const { data } = message;
				handler(data);
			}
		};
		this.clientWS.addEventListener('message', listener);
		return () => this.clientWS.removeEventListener('message', listener);
	}
	public async onJoin(handler: (channel: Channel) => any) {
		await this.clientWS.opened;
		const listener = (event: MessageEvent) => {
			const message = this.deserialize<ChatReceiveFormat<Channel>>(event.data);
			if (message.tag == 'join') {
				const { data } = message;
				handler(data);
			}
		};
		this.clientWS.addEventListener('message', listener);
		return () => this.clientWS.removeEventListener('message', listener);
	}
	public async onClose(handler: (code: number, reason: string) => any) {
		await this.clientWS.opened;
		const listener = (event: CloseEvent) => {
			handler(event.code, event.reason);
		};
		this.clientWS.addEventListener('close', listener);
		return () => this.clientWS.removeEventListener('close', listener);
	}
	public serialize<D = any>(data: D) {
		return JSON.stringify(data);
	}
	public deserialize<D = any>(data: string) {
		return JSON.parse(data) as D;
	}
}
