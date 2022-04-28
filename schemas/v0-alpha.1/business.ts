import D from '../../data.json';
import { Data as Buyer } from './buyer';
import { Data as BuyerAddress } from './buyer-address';
import { Data as Item } from './selected-item';
import { Data as Product } from './product';
import { Data as Store } from './store';
import { Data as Order } from './order';

export type Data = typeof D;
export type { Buyer, BuyerAddress, Item, Product, Store, Order };
export interface CheckoutData {}
export interface OrderData {
	buyer: Buyer;
	address: BuyerAddress;
	items: (Item & { product: Product & { store: Store } })[];
	weight: number[];
	range: number[];
	item?: { amount: number; productId: number };
}
