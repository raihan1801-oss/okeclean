<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Icon,
		Divider,
	} from 'svelte-materialify/src';
	import { mdiChevronLeft, mdiStorefrontOutline } from '@mdi/js';
	import { mdiClipboardTextClockOutline } from '$lib/icons';
	import ProgressLinear from '$components/progress-linear.svelte';
	import OrderCard from '../_order-item.svelte';
	import CartCard from '$components/cart-card.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';

	import type { BuyerClient } from '../../__layout.svelte';
	import { Currency } from '$lib/helper';

	const title = 'Daftar Menunggu';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	let loader: ProgressLinear;
	let user: BuyerClient.Buyer;
	let orders: (BuyerClient.Order & {
		store: BuyerClient.Store;
		item: (BuyerClient.OrderedItem & {
			product: BuyerClient.Product;
		})[];
		delivery: BuyerClient.Delivery;
	})[] = [];
	let fakeOrder = Array(4);
	let showUserUnauthDialog = false;

	$: isLoading = loader?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user = await client.auth();
			orders = await client.api.order.searchMany({
				where: {
					AND: [{ buyerId: user.id }, { status: 'Queue' }],
				},
				include: {
					item: { include: { product: true } },
					store: true,
					delivery: true,
				},
			});
			fakeOrder = Array(0);
		} catch (error: any) {
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
	async function imgStoreDownload(url: string) {
		return URL.createObjectURL(await client.api.store.downloadImage(url));
	}
	async function imgProductDownload(url: string) {
		return URL.createObjectURL(await client.api.product.downloadImage(url));
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear bind:this="{loader}" />
		<AppBar class="primary-color {$isLoading ? 'top-4' : ''}">
			<span slot="icon">
				<Button fab icon text size="small" on:click="{() => history.back()}">
					<Icon path="{mdiChevronLeft}" />
				</Button>
			</span>
			<span slot="title">{title}</span>
		</AppBar>
		<main>
			{#each fakeOrder as value}
				<OrderCard />
			{/each}
			{#each orders as order}
				<OrderCard
					order="{order}"
					productDownload="{imgProductDownload}"
					storeDownload="{imgStoreDownload}" />
			{/each}
		</main>
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../../components/common';
	@import '../../../components/skeleton';
	@import '../../../components/elevation';
	.loading {
		@include loading-sekeleton;
	}
	.card {
		@include elevation;
		border-radius: 6px;
	}
	main {
		padding: 24px 16px;
		display: grid;
		row-gap: 24px;
		align-content: start;
		@include main;
	}
	* :global {
		@include common-loader;
		@include common-app {
			background-color: #f7f7f7;
		}
		@include common-appbar;
		@include common-footer;
	}
</style>
