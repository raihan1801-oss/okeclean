<script context="module" lang="ts">
	import { setContext, onMount } from 'svelte';
	import { dev } from '$app/env';
	import { APIS_URL, WS_URL, FETCH_MODE } from '$lib/env';
	import { mediaQuery, ObserverUnsafe } from '$lib/helper';
	import Token from '$lib/token';
	import Api from '$lib/client-api';
	import { Service } from '$lib/service-register';

	import UserApi from '$apis/user';
	import FeatureApi from '$apis/feature';
	import TransactionApi from '$apis/transaction';

	import BuyerApi from '$apis/buyer';
	import AddressApi from '$apis/buyer-address';
	import CartApi from '$apis/cart';
	import ProductApi from '$apis/product';
	import StoreApi from '$apis/store';
	import RatingApi from '$apis/rating';
	import SelectedItemApi from '$apis/selected-item';
	import OrderApi from '$apis/order';
	import BusinessApi from '$apis/business';
	import ChatApi from '$apis/chat';
	import { BuyerClient } from '$lib/buyer';

	export type { BuyerClient, Service };

	const token = new Token('customer', { debug: dev });
	const token_cleaner = new Token('cleaner', { debug: dev });
	const api = new Api({
		base: APIS_URL,
		wsbase: WS_URL,
		version: 'v0-alpha.1',
		mode: FETCH_MODE,
		debug: dev,
	});

	const userApi = new UserApi(api, token);
	const cleaner_api = new UserApi(api, token_cleaner);
	const featureApi = new FeatureApi(api, token);
	const transactionApi = new TransactionApi(api, token);

	const buyerApi = new BuyerApi(api, token);
	const addressApi = new AddressApi(api, token);
	const cartApi = new CartApi(api, token);
	const productApi = new ProductApi(api, token);
	const storeApi = new StoreApi(api, token);
	const ratingApi = new RatingApi(api, token);
	const selectedItemApi = new SelectedItemApi(api, token);
	const orderApi = new OrderApi(api, token);
	const businessApi = new BusinessApi(api, token);
	const chatApi = new ChatApi(api, token);
	const buyer = new BuyerClient({
		user: userApi,
		cleaner: cleaner_api,
		feature: featureApi,
		transaction: transactionApi,

		buyer: buyerApi,
		address: addressApi,
		cart: cartApi,
		product: productApi,
		store: storeApi,
		rating: ratingApi,
		selectedItem: selectedItemApi,
		order: orderApi,
		business: businessApi,
		chat: chatApi,
	});
	const is_desktop = new ObserverUnsafe(false);
	const service = new Service({debug: dev});
</script>

<script>
	setContext('buyer', buyer);
	setContext('is_desktop', is_desktop);
	setContext('service', service);
	onMount(() => {
		buyer.init();
		mediaQuery('(min-width: 1200px)', (media) => {
			is_desktop.set(media.matches);
			media.addEventListener('change', (event) => {
				is_desktop.set(media.matches);
			});
		});
		service.init();
	});
</script>

<style lang="scss" global>
	html {
		scrollbar-width: thin;
		scrollbar-color: #00796b9e #d3d3d3;
		transition: scrollbar-color ease 250ms;
	}
</style>

<slot />
