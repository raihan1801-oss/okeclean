import Token from '$lib/token';
import Api from '$lib/client-api';
import SellerApi from '$apis/seller';
import StoreApi from '$apis/store';
import ProductApi from '$apis/product';
import OrderApi from '$apis/order';
import OrderedItemApi from '$apis/ordered-item';
import CourierApi from '$apis/courier';
import DeliveryApi from '$apis/delivery';
import ChatApi from '$apis/chat';

import { Promiseify } from './helper';

import type { User } from '$lib/token';
import type { Version } from '$lib/client-api';

import type { Data as BuyerData } from '$apis/buyer';
import type { Data as SellerData } from '$apis/seller';
import type { Data as CourierData } from '$apis/courier';

import type { Data as StoreData } from '$apis/store';
import type { Data as ProductData } from '$apis/product';
import type { Data as OrderData } from '$apis/order';
import type { Data as OrderedItemData } from '$apis/ordered-item';
import type { Data as AddressData } from '$apis/buyer-address';
import type { Data as DeliveryData } from '$apis/delivery';
import type * as ChatData from '$apis/chat';

export namespace CourierClientApi {
	export type Buyer = BuyerData;
	export type Seller = SellerData;
	export type Courier = CourierData;

	export type Store = StoreData;
	export type Product = ProductData;
	export type Order = OrderData;
	export type OrderedItem = OrderedItemData;
	export type BuyerAddress = AddressData;
	export type Delivery = DeliveryData;

	export namespace Chat {
		export type Channel = ChatData.Channel;
		export type ChatReceiveFormat = ChatData.ChatReceiveFormat;
		export type ChatSendFormat = ChatData.ChatSendFormat;
	}
}

export class CourierClientApi {
	public product: ProductApi;

	public courier: CourierApi;
	public delivery: DeliveryApi;
	public chat: ChatApi;

	private instance = new Promiseify<CourierClientApi>();
	constructor({
		base,
		wsbase,
		debug,
		mode,
		role,
		version,
	}: {
		role: User;
		base: string;
		wsbase: string;
		version: Version;
		debug: boolean;
		mode: RequestMode;
	}) {
		const api = new Api({
			base,
			wsbase,
			version,
			mode,
			debug,
		});
		const token = new Token(role);

		this.product = new ProductApi(api, token);
		this.courier = new CourierApi(api, token);
		this.delivery = new DeliveryApi(api, token);
		this.chat = new ChatApi(api, token);
	}
	public get ready() {
		return this.instance;
	}
	public init() {
		this.product.init();
		this.courier.init();
		this.delivery.init();
		this.chat.init();
		this.instance.resolver(this);
		return this;
	}
}
