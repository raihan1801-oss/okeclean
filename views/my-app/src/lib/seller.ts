import Token from '$lib/token';
import Api from '$lib/client-api';
import SellerApi from '$apis/seller';
import StoreApi from '$apis/store';
import ProductApi from '$apis/product';
import OrderApi from '$apis/order';
import OrderedItemApi from '$apis/ordered-item';
import ChatApi from '$apis/chat';

import type { User } from '$lib/token';
import type { Version } from '$lib/client-api';
import type { Data as BuyerData } from '$apis/buyer';
import type { Data as SellerData } from '$apis/seller';
import type { Data as CourierData } from '$apis/courier';

import type { Data as StoreData } from '$apis/store';
import type { Data as ProductData } from '$apis/product';
import type { Data as OrderData } from '$apis/order';
import type { Data as OrderedItemData } from '$apis/ordered-item';
import type { Data as DeliveryData } from '$apis/delivery';
import type { Data as AddressData } from '$apis/buyer-address';
import type { Data as RatingData } from '$apis/rating';
import type * as ChatData from '$apis/chat';

import { Promiseify } from './helper';

export namespace SellerClientApi {
	// export namespace Data {
	// 	export type Buyer = BuyerData;
	// 	export type Seller = SellerData;
	// 	export type Courier = CourierData;

	// 	export type Store = StoreData;
	// 	export type Product = ProductData;
	// 	export type Order = OrderData;
	// 	export type OrderedItem = OrderedItemData;
	// 	export type Delivery = DeliveryData;
	// 	export type BuyerAddress = AddressData;
	// }
	export type Buyer = BuyerData;
	export type Seller = SellerData;
	export type Courier = CourierData;

	export type Store = StoreData;
	export type Product = ProductData;
	export type Order = OrderData;
	export type OrderedItem = OrderedItemData;
	export type Delivery = DeliveryData;
	export type BuyerAddress = AddressData;
	export type Rating = RatingData;

	export namespace Chat {
		export type Channel = ChatData.Channel;
		export type ChatReceiveFormat = ChatData.ChatReceiveFormat;
		export type ChatSendFormat = ChatData.ChatSendFormat;
	}
}
interface Options {
	role: User;
	base: string;
	wsbase: string;
	version: Version;
	debug: boolean;
	mode: RequestMode;
}
export class SellerClientApi {
	public seller: SellerApi;
	public store: StoreApi;
	public product: ProductApi;
	public order: OrderApi;
	public orderedItem: OrderedItemApi;
	public chat: ChatApi;
	public options: Options
	private instance = new Promiseify<SellerClientApi>();
	constructor(options: Options)  {
		this.options = Object.assign({}, options);
		const {base, wsbase, debug, mode, role, version} = this.options;
		const api = new Api({
			base,
			wsbase,
			version,
			mode,
			debug,
		});
		const token = new Token(role as any);
		this.seller = new SellerApi(api, token);
		this.store = new StoreApi(api, token);
		this.product = new ProductApi(api, token);
		this.order = new OrderApi(api, token);
		this.orderedItem = new OrderedItemApi(api, token);
		this.chat = new ChatApi(api, token);
	}
	public get ready() {
		return this.instance;
	}
	public init() {
		this.seller.init();
		this.store.init();
		this.product.init();
		this.order.init();
		this.orderedItem.init();
		this.chat.init();
		this.instance.resolver(this);
		return this;
	}
}
