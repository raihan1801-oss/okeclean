import type ClientApi from './client-api';

import type UserApi from '$apis/user';
import type FeatureApi from '$apis/feature';
import type TransactionApi from '$apis/transaction';

import type BuyerApi from '$apis/buyer';
import type AddressClientApi from '$apis/buyer-address';
import type CartClientApi from '$apis/cart';
import type OrderClientApi from '$apis/order';
import type SelectedItemClientApi from '$apis/selected-item';
import type ProductClientApi from '$apis/product';
import type StoreClientApi from '$apis/store';
import type RatingClientApi from '$apis/rating';
import type BusinessClientApi from '$apis/business';
import type ChatApi from '$apis/chat';

import type { Data as UserData } from '$apis/user';
import type { Data as FeatureData } from '$apis/feature';
import type { Data as TransactionData } from '$apis/transaction';

import type {
	Data,
	RegisterData,
	UnregisterData,
	LoginData,
	ChangePasswordData,
	UpdateQuery,
} from '$apis/buyer';
import type { Data as SellerData } from '$apis/seller';
import type { Data as CourierData } from '$apis/courier';
import type {
	Data as AddressData,
	CreateQuery as AddressCreateQuery,
	UpdateQuery as AddressUpdateQuery,
} from '$apis/buyer-address';
import type { Data as CartData } from '$apis/cart';
import type { Data as GroupOrderData } from '$apis/group-order';
import type { Data as SelectedItemData } from '$apis/selected-item';
import type { Data as OrderedItemData } from '$apis/ordered-item';
import type { Data as ProductData } from '$apis/product';
import type { Data as StoreData } from '$apis/store';
import type { Data as OrderData } from '$apis/order';
import type { Data as RatingData } from '$apis/rating';
import type { Data as DeliveryData } from '$apis/delivery';
import type { Data as BusinessData } from '$apis/business';
import type * as ChatData from '$apis/chat';

import { Promiseify } from './helper';

export type { Data };

export namespace BuyerClient {
	export type User = UserData;
	export type Feature = FeatureData;
	export type Transaction = TransactionData;

	export type Buyer = Data;
	export type Seller = SellerData;
	export type Courier = CourierData;
	export type Address = AddressData;
	export type Cart = CartData;
	export type GroupOrder = GroupOrderData;
	export type SelectedItem = SelectedItemData;
	export type OrderedItem = OrderedItemData;
	export type Product = ProductData;
	export type Store = StoreData;
	export type Rating = RatingData;
	export type Order = OrderData;
	export type Delivery = DeliveryData;
	export type Business = BusinessData;
	export namespace Chat {
		export type Contact = ChatData.Channel;
		export type ChatReceiveFormat = ChatData.ChatReceiveFormat;
		export type ChatSendFormat = ChatData.ChatSendFormat;
		export type ConnectContact = ChatData.ConnectContact;
	}
}

export class BuyerClient {
	private data?: Data;
	public ready: Promiseify<BuyerClient> = new Promiseify();
	constructor(
		public api: {
			user: UserApi;
			cleaner: UserApi;
			feature: FeatureApi;
			transaction: TransactionApi;

			buyer: BuyerApi;
			address: AddressClientApi;
			cart: CartClientApi;
			selectedItem: SelectedItemClientApi;
			order: OrderClientApi;
			product: ProductClientApi;
			store: StoreClientApi;
			rating: RatingClientApi;
			business: BusinessClientApi;
			chat: ChatApi;
		}
	) {}
	public get Error() {
		return (this.api.buyer.api.constructor as typeof ClientApi).Utility.Error
			.Const;
	}
	public async init() {
		this.api.user.init();
		this.api.cleaner.init();
		this.api.feature.init();
		this.api.transaction.init();

		this.api.buyer.init();
		this.api.address.init();
		this.api.cart.init();
		this.api.selectedItem.init();
		this.api.product.init();
		this.api.store.init();
		this.api.rating.init();
		this.api.order.init();
		this.api.business.init();
		this.api.chat.init();
		this.ready.resolver(this);
	}
	public set(data: Data) {
		return (this.data = data);
	}
	public get() {
		return this.data;
	}
	public register(data: RegisterData) {
		return this.api.buyer.register(data);
	}
	public unregister(data: UnregisterData) {
		return this.api.buyer.unregister(data);
	}
	public changePassword(data: ChangePasswordData) {
		return this.api.buyer.changePassword(data);
	}
	public login(data: LoginData) {
		return this.api.buyer.login(data);
	}
	public async logout() {
		await this.api.buyer.token.remove();
		delete this.data;
	}
	public auth() {
		return this.api.buyer.auth();
	}
	public generate() {}
	public verify() {}
	public async update(data: UpdateQuery['data'], image?: File) {
		if (this.data) {
			if (image) {
				data.image = await this.api.buyer.uploadImage(
					`${this.data.id}/${image.name}`,
					image
				);
			}
			return this.api.buyer.update({ data, where: { id: this.data.id } });
		} else {
			throw new Error('Data tidak ditemukan');
		}
	}
	public download(path: string) {
		return this.api.buyer.downloadImage(path);
	}
	public address = new (class {
		constructor(protected parent: BuyerClient) {}
		public get(id?: number) {
			return this.parent.api.address.search({
				where: { OR: [{ id }, { buyerId: this.parent.data?.id }] },
			});
		}
		public add(data: AddressCreateQuery['data']) {
			return this.parent.api.address.create({ data });
		}
		public set(id: number, data: AddressUpdateQuery['data']) {
			return this.parent.api.address.update({ where: { id }, data });
		}
		public del(id: number) {
			return this.parent.api.address.delete({ where: { id } });
		}
		public getAll() {
			if (this.parent.data) {
				return this.parent.api.address.searchMany({
					where: { buyerId: this.parent.data.id },
				});
			} else {
				throw new Error('Data tidak ditemukan');
			}
		}
		public async setSelected(data: { id: number; selected: boolean }) {
			return this.parent.api.address.batch([
				{
					updateMany: {
						where: { id: { not: data.id } },
						data: { selected: !data.selected },
					},
				},
				{
					update: {
						where: { id: data.id },
						data: { selected: data.selected },
					},
				},
			]);
		}
	})(this);
}
