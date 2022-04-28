<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Icon,
		Select,
		TextField,
	} from 'svelte-materialify/src';
	import { mdiChevronLeft, mdiMagnify, mdiStorefrontOutline } from '@mdi/js';
	import ProgressLinear from '$components/progress-linear.svelte';
	import OrderCard from './_order-item.svelte';
	import CartCard from '$components/cart-card.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	import type { BuyerClient } from '../__layout.svelte';

	type Data = BuyerClient.Order & {
		store: BuyerClient.Store;
		item: (BuyerClient.OrderedItem & {
			product: BuyerClient.Product;
		})[];
		delivery: BuyerClient.Delivery;
	};

	const title = 'Daftar Semua Pesanan';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	let loader: ProgressLinear;
	let user: BuyerClient.Buyer;
	let orders: Data[] = [];
	let copy: Data[] = [];
	let fakeOrder = Array(4);
	let showUserUnauthDialog = false;
	let filter = [
		{ name: 'Menunggu', value: 'Queue' },
		{ name: 'Proses', value: 'Process' },
		{ name: 'Kirim', value: 'Delivery' },
		{ name: 'Konfirmasi', value: 'Confirm' },
		{ name: 'Selesai', value: 'Done' },
		{ name: 'Tolak', value: 'Reject' },
		{ name: 'Semua', value: '.*' },
	];
	let filterText = 'Semua';
	let searchText = '';

	$: isLoading = loader?.active;
	$: filtering(filterText);
	$: searching(searchText);

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user = await client.auth();
			orders = await client.api.order.searchMany({
				where: {
					AND: [{ buyerId: user.id }],
				},
				include: {
					item: { include: { product: true } },
					store: true,
					delivery: true,
				},
			});
			fakeOrder = Array(0);
			copy = orders;
		} catch (error: any) {
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
	async function filtering(tag: string) {
		query({ filter: filterText, search: searchText });
	}
	async function searching(tag: string) {
		query({ filter: filterText, search: searchText });
	}
	async function query(data: { filter: string; search: string }) {
		const filter = RegExp(data.filter);
		const search = RegExp(data.search);
		orders = copy.filter((data) => {
			const filterResult = filter.test(data.status);
			let searchResult = true;
			if (searchText) {
				searchResult =
					search.test(data.store.name) ||
					data.item.some((item) => search.test(item.product.name));
			}
			return searchResult && filterResult;
		});
	}
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
			<section class="card bar p-16">
				<TextField outlined dense bind:value="{searchText}">
					<Button fab text size="small" slot="prepend">
						<Icon class="grey-text text-darken-4" path="{mdiMagnify}" />
					</Button>
				</TextField>
				<Select dense outlined items="{filter}" bind:value="{filterText}">Status</Select>
			</section>
			{#each fakeOrder as value}
				<OrderCard />
			{/each}
			{#each orders as order}
				<OrderCard
					status
					order="{order}"
					productDownload="{imgProductDownload}"
					storeDownload="{imgStoreDownload}" />
			{/each}
		</main>
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	@import '../../components/elevation';
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
	.bar {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		@include medium-up {
			grid-template-columns: 1fr 1fr;
		}
	}
	.p-8 {
		padding: 8px;
	}
	.p-16 {
		padding: 16px;
	}
	* :global {
		@include common-loader;
		@include common-app {
			background-color: #f7f7f7;
		}
		@include common-appbar;
		@include common-footer;
		.s-text-field {
			label {
				opacity: 0;
			}
		}
		.s-select input,
		.s-list-item__content {
			line-height: normal;
		}
	}
</style>
