<script context="module" lang="ts">
	import { onMount, onDestroy, setContext, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide, scale } from 'svelte/transition';
	import { getStores, navigating, page, session } from '$app/stores';
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';

	import { APIS_URL } from '$lib/env';
	import ClientApi from '$lib/client-api';
	import UserStore from '$lib/token';

	import User from '$apis/user';

	import Buyer from '$apis/buyer';
	import Seller from '$apis/seller';
	import Courier from '$apis/courier';

	export interface Context {
		user: User;
		buyer: Buyer;
		seller: Seller;
		courier: Courier;
	}
	export type Roles = typeof roles;

	// import logo from '$static/logo.png';

	// export { logo };

	const clientApi = new ClientApi({ base: APIS_URL, version: 'v0-alpha.1' });

	const user = new User(clientApi, new UserStore('buyer', { debug: dev }));

	const buyer = new Buyer(clientApi, new UserStore('buyer', { debug: dev }));
	const seller = new Seller(clientApi, new UserStore('seller', { debug: dev }));
	const courier = new Courier(
		clientApi,
		new UserStore('courier', { debug: dev })
	);
	const roles = [
		{
			name: "Pelanggan",
			value: "customer",
		},
		{
			name: "Pembersih",
			value: "cleaner",
		},
	];
</script>

<script lang="ts">
	setContext<Context>('layout', {
		user,

		buyer,
		seller,
		courier,
	});
	setContext("roles", roles);
	onMount(init);
	onDestroy(release);
	function init() {
		user.init();

		buyer.init();
		seller.init();
		courier.init();
	}
	function release() {}
</script>

<style lang="scss"></style>

<slot />
