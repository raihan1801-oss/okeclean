import Token from '$lib/token';
import StdApi from '$lib/client-api';
import { Promiseify } from '$lib/helper';

import UserApi from '$apis/user';
import FeatureApi from '$apis/feature';
import TransactionApi from '$apis/transaction';

import BuyerApi from '$apis/buyer';
import SellerApi from '$apis/seller';
import CourierApi from '$apis/courier';
import InternalApi from '$apis/internal';

import AdminApi from '$apis/admin';

import StoreApi from '$apis/store';
import ProductApi from '$apis/product';
import OrderApi from '$apis/order';
import OrderedItemApi from '$apis/ordered-item';

import DeliveryApi from '$apis/delivery';

import ChatNode from '$apis/chat-node';
import ChatMessageStack from '$apis/chat-channel';
import ChatMessage from '$apis/chat-message';

import ChatApi from '$apis/chat';

import type { User } from '$lib/token';
import type { Version } from '$lib/client-api';

import type { Data as UserData } from '$apis/user';
import type * as FeatureData from '$apis/feature';
import type { 
	Data as TransactionData,
	TransactionData as TransactionDataData,
	DailyCleaningService as TransactionDailyCleaningService,
} from '$apis/transaction';

import type { Data as BuyerData } from '$apis/buyer';
import type { Data as SellerData } from '$apis/seller';
import type { Data as CourierData } from '$apis/courier';
import type { Data as InternalData } from '$apis/internal';

import type * as AdminData from '$apis/admin';

import type { Data as CartData } from '$apis/cart';
import type { Data as StoreData } from '$apis/store';
import type { Data as ProductData } from '$apis/product';
import type { Data as OrderData } from '$apis/order';
import type { Data as OrderedItemData } from '$apis/ordered-item';
import type { Data as DeliveryData } from '$apis/delivery';
import type { Data as AddressData } from '$apis/buyer-address';

import type { Data as ChatNodeData } from '$apis/chat-node';
import type { Data as ChatMessageStackData } from '$apis/chat-channel';
import type { Data as ChatMessageData } from '$apis/chat-message';

import type * as ChatData from '$apis/chat';

export namespace ClientApi {
	export type User = UserData;
	export type Feature = FeatureData.Data;
	export type Transaction = TransactionData;

	export type Buyer = BuyerData;
	export type Seller = SellerData;
	export type Courier = CourierData;
	export type Internal = InternalData;

	export namespace Feature {
		export type DailyCleaningData = FeatureData.DailyCleaningData
	}
	export namespace Transaction {
		export type TransactionData = TransactionDataData
		export type DailyCleaningService = TransactionDailyCleaningService
	}
	export namespace Admin {
		export type Stat = AdminData.Stat;
		export type Data = AdminData.Data;
		export type User = AdminData.User;
		export type Slide = AdminData.Slide;
		export type Product = AdminData.ProductData;
		export type Order = AdminData.OrderData;
		export type OrderDetail = AdminData.OrderDataDetail;
		export type Sale = AdminData.Sale;
		export type SaleDetail = AdminData.SaleDetail;
		export type Subs = AdminData.Subs;
		export type DirTree = AdminData.DirTree;
		export type DirFile = AdminData.DirFile;
	}

	export type Cart = CartData;
	export type Store = StoreData;
	export type Product = ProductData;
	export type Order = OrderData;
	export type OrderedItem = OrderedItemData;
	export type Delivery = DeliveryData;
	export type BuyerAddress = AddressData;

	export type ChatNode = ChatNodeData;
	export type ChatMessageStack = ChatMessageStackData;
	export type ChatMessage = ChatMessageData;

	export namespace Chat {
		export type Channel = ChatData.Channel;
		export type ChatReceiveFormat = ChatData.ChatReceiveFormat;
		export type ChatSendFormat = ChatData.ChatSendFormat;
	}
}
interface Options {
	role: User;
	base: string;
	esbase: string;
	wsbase: string;
	version: Version;
	debug: boolean;
	mode: RequestMode;
}
export class ClientApi {
	public user: UserApi;
	public feature: FeatureApi;
	public transaction: TransactionApi;

	public buyer: BuyerApi;
	public seller: SellerApi;
	public courier: CourierApi;
	public internal: InternalApi;

	public admin: AdminApi;

	public store: StoreApi;
	public product: ProductApi;
	public order: OrderApi;
	public orderedItem: OrderedItemApi;

	public delivery: DeliveryApi;

	public chatNode: ChatNode;
	public chatChannel: ChatMessageStack;
	public chatMessage: ChatMessage;

	public chat: ChatApi;

	public options: Options;
	public stdApi: StdApi;

	private instance = new Promiseify<ClientApi>();
	constructor(options: Options) {
		this.options = Object.assign({}, options);
		const { base, esbase, wsbase, debug, mode, role, version } = this.options;
		const stdApi = new StdApi({
			base,
			esbase,
			wsbase,
			version,
			mode,
			debug
		});
		const token = new Token(role);

		this.stdApi = stdApi;

		this.user = new UserApi(stdApi, token);
		this.feature = new FeatureApi(stdApi, token);
		this.transaction = new TransactionApi(stdApi, token);

		this.seller = new SellerApi(stdApi, token);
		this.buyer = new BuyerApi(stdApi, token);
		this.courier = new CourierApi(stdApi, token);
		this.internal = new InternalApi(stdApi, token);

		this.admin = new AdminApi(stdApi, token);

		this.store = new StoreApi(stdApi, token);
		this.product = new ProductApi(stdApi, token);
		this.order = new OrderApi(stdApi, token);
		this.orderedItem = new OrderedItemApi(stdApi, token);

		this.delivery = new DeliveryApi(stdApi, token);

		this.chatNode = new ChatNode(stdApi, token);
		this.chatChannel = new ChatMessageStack(stdApi, token);
		this.chatMessage = new ChatMessage(stdApi, token);

		this.chat = new ChatApi(stdApi, token);
	}
	public get ready() {
		return this.instance;
	}
	public init() {
		this.user.init();
		this.feature.init();
		this.transaction.init();

		this.buyer.init();
		this.seller.init();
		this.courier.init();
		this.internal.init();

		this.admin.init();

		this.store.init();
		this.product.init();
		this.order.init();
		this.orderedItem.init();

		this.delivery.init();

		this.chatNode.init();
		this.chatChannel.init();
		this.chatMessage.init();

		this.chat.init();

		this.instance.resolver(this);

		window.addEventListener('error', (event) => {
			console.log('error', event);
		});
		window.addEventListener('rejectionhandled', (event) => {
			console.log('rejectionhandled', event);
		});

		return this;
	}
}
