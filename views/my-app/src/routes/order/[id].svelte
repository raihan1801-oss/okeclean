<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Icon,
		Footer,
		List,
		ListItem,
		Menu,
	} from 'svelte-materialify/src';
	import { mdiChevronLeft, mdiMessageTextOutline } from '@mdi/js';
	import ProgressLinear from '$components/progress-linear.svelte';
	import OrderDetail from './_order-detail.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import { wait } from '$lib/helper';

	import type { BuyerClient } from '../__layout.svelte';

	const title = 'Detail Pesanan';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	let loader: ProgressLinear;
	let user: BuyerClient.Buyer;
	let order: BuyerClient.Order & {
		item: (BuyerClient.OrderedItem & {
			product: BuyerClient.Product;
		})[];
		delivery: BuyerClient.Delivery & {
			recipient: BuyerClient.Address;
			sender: BuyerClient.Store;
			courier: BuyerClient.Courier | null;
		};
	};
	let snackbar: Snackbar;
	let showUserUnauthDialog = false;
	let disable = false;
	let contact: { name: string; telp: string; node: number }[] = [];

	$: isLoading = loader?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user = await client.auth();
			order = await client.api.order.search({
				where: {
					AND: [{ buyerId: user.id }, { id: +$page.params.id }],
				},
				include: {
					buyer: true,
					item: { include: { product: true } },
					delivery: {
						include: { recipient: true, sender: true, courier: true },
					},
				},
				rejectOnNotFound: true,
			});
			contact = [
				{
					name: 'Toko',
					telp: order.delivery.sender.telp,
					node: order.delivery.sender.chatNodeId,
				},
				{
					name: 'Kurir',
					telp: order.delivery.courier?.telp ?? '-',
					node: order.delivery.courier?.chatNodeId ?? 0,
				},
			];
		} catch (error: any) {
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
	async function accept() {
		try {
			loader.loading();
			disable = true;
			if (order.status == 'Delivery') {
				await client.api.order.update({
					where: { id: order.id },
					data: {
						delivery: {
							update: {
								confirmed: true,
							},
						},
					},
				});
				snackbar.setText('Pengiriman terkonfirmasi');
				snackbar.show();
				await wait({ timeout: 1000 });
				goto('/order', { replaceState: true });
			} else if (order.status == 'Confirm') {
				await client.api.order.update({
					where: { id: order.id },
					data: {
						confirmed: true,
					},
				});
				snackbar.setText('Pembelian terkonfirmasi');
				snackbar.show();
				loader.sequencing(1250);
				await wait({ timeout: 1250 });
				goto('/order/rating/' + order.id, { replaceState: true });
			}
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
			disable = false;
		} finally {
			loader.loaded();
		}
	}
	async function downloader(src: string) {
		return URL.createObjectURL(await client.api.product.downloadImage(src));
	}
</script>

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
		padding: 24px 0;
		display: grid;
		row-gap: 24px;
		align-content: start;
		@include main;
	}
	form {
		display: grid;
		row-gap: 24px;
	}
	.btn {
		width: stretch;
		height: stretch;
		display: grid;
		grid-template-columns: minmax(44px, max-content) 1fr;
		grid-template-rows: minmax(44px, auto);
		grid-auto-flow: column;
		align-items: center;
		column-gap: 8px;
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
			<form autocomplete="off">
				<OrderDetail order="{order}" downloader="{downloader}" />
			</form>
		</main>
		<Footer class="white elevation-5">
			<div class="btn">
				{#if order}
					<Menu closeOnClick closeOnClickOutside openOnClick bottom>
						<div slot="activator">
							<Button class="" fab text size="small">
								<Icon path="{mdiMessageTextOutline}" />
							</Button>
						</div>
						<List>
							{#each contact as item}
								<ListItem
									on:click="{() => {
										goto('/chat?connectTo=' + item.node);
									}}"
								>
									<div>{item.name}</div>
									<div slot="subtitle">{item.telp}</div>
								</ListItem>
							{/each}
						</List>
					</Menu>
					{#if order.status == 'Queue'}
						<div></div>
					{:else if order.status == 'Process'}
						<div></div>
					{:else if order.status == 'Delivery'}
						{#if order.delivery.confirmed}
							<Button class="" disabled>Sampai</Button>
						{:else}
							<Button
								class="primary-color"
								disabled="{disable}"
								on:click="{accept}">Sampai</Button
							>
						{/if}
					{:else if order.status == 'Confirm'}
						{#if order.confirmed}
							<Button class="" disabled>Selesai</Button>
						{:else}
							<Button
								class="primary-color"
								disabled="{disable}"
								on:click="{accept}">Selesai</Button
							>
						{/if}
					{:else if order.status == 'Done'}
						<div></div>
					{:else if order.status == 'Reject'}
						<div></div>
					{/if}
				{:else}
					<div class="loading">&nbsp;</div>
					<div class="loading">&nbsp;</div>
				{/if}
			</div>
		</Footer>
		<Snackbar bind:this="{snackbar}" />
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>
