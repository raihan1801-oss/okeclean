import D from '../../data.json';
import { Data as Buyer } from './buyer';
import { Data as BuyerAddress } from './buyer-address';
import { Data as Item } from './selected-item';
import { Data as Product } from './product';
import { Data as Store } from './store';
import { Data as Order } from './order';
import { Data as OrderedItem } from './ordered-item';
import { Data as Delivery } from './delivery';
import { Data as Courier } from './courier';
import { Data as Rating } from './rating';
import { Data as Subscriber } from './subscriber';

export type { DirTree, DirFile } from '../../utility/storage';

export type Data = typeof D;
export type {
	Buyer,
	BuyerAddress,
	Item,
	Product,
	Store,
	Order,
	OrderedItem,
	Delivery,
};

export type Stat = {
	user: number;
	order: number;
	// product: number;
	sales: string;
	// subscriber: number;
};
export type SentEvent<D = any> = {
	tag: string;
	data: D;
};
export type Slide = {
	id: number;
	href: string;
	src: string;
};
export type User = {
	id: number;
	node: number;
	role: string;
	username: string;
	email: string;
	telp?: string | null;
	address?: string | null;
	image?: string | null;
};
export type ProductData = Product & {
	store: Store;
};
export type OrderData = Order & {
	item: (OrderedItem & { product: Product })[];
	delivery: Delivery & { sender: Store; recipient: BuyerAddress };
};
export type OrderDataDetail = Order & {
	item: (OrderedItem & { product: Product })[];
	delivery: Delivery & {
		sender: Store;
		recipient: BuyerAddress & { buyer: Buyer | null };
		courier: Courier | null;
	};
};
export type Sale = Order & {
	buyer: Buyer;
	store: Store;
	delivery: Delivery;
	item: (OrderedItem & {
		product: Product;
	})[];
	rating:
		| Rating
		| null;
};
export type SaleDetail = Order & {
	buyer: Buyer;
	delivery: Delivery & {
		sender: Store;
		recipient: BuyerAddress;
		courier: Courier | null;
	};
	item: (OrderedItem & {
		product: Product;
	})[];
	rating: Rating | null;
};
export type Subs = Subscriber;
