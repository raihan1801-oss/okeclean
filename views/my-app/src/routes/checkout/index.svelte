<script context="module" lang="ts">
	import {
		MaterialAppMin,
		Footer,
		Button,
	} from 'svelte-materialify/src';
	import CartCard from '$components/cart-card.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';
	import Address, { Map } from './_address.svelte';
	import ProgressLinear from '$components/progress-linear.svelte';
	import Appbar from '../_appbar.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Currency, wait } from '$lib/helper';

	import type { ObserverUnsafe } from '$lib/helper';
	import type { BuyerClient } from '../__layout.svelte';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	let buyer: BuyerClient.Buyer;
	let address: BuyerClient.Address | null | undefined;
	let addressList: BuyerClient.Address[] = [];
	let cart: BuyerClient.Cart;
	let items: (BuyerClient.SelectedItem & {
		product: BuyerClient.Product & { store: BuyerClient.Store };
	})[] = [];
	let procedure: BuyerClient.Business;
	let progress: ProgressLinear;
	let fakeItems = Array(4);
	let snackbar: Snackbar;
	let orderCost = 0;
	let deliveryCost = 0;
	let totalCost = 0;
	let itemAmount = 0;
	let weight: number[] = [];
	let range: number[] = [];
	let editAddress = false;
	let showUserUnauthDialog = false;
	let disableSubmit = true;

	$: loading = progress?.active;
	$: calculate(items);
	$: checkAddress(address);

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			buyer = await client.auth();
			addressList = await client.api.address.searchMany({
				where: { buyerId: buyer.id },
			});
			address = addressList.find((item) => item.selected == true) ?? null;
			cart = await client.api.cart.search({
				where: { buyerId: buyer.id },
				rejectOnNotFound: true,
			});
			items = await client.api.selectedItem.searchMany({
				where: { AND: [{ cartId: cart.id }, { checked: true }] },
				include: { product: { include: { store: true } } },
			});
			procedure = await client.api.business.get();
			fakeItems = Array(0);
		} catch (error: any) {
			if (error.type == client.api.buyer.api.Error.FailedAuthentication.type) {
				showUserUnauthDialog = true;
				return;
			}
			snackbar.setText(error.message);
			snackbar.show();
		} finally {
			progress.loaded();
		}
	}
	async function release() {}
	function calculate(tag: any) {
		itemAmount = 0;
		orderCost = 0;
		weight = [];
		for (const item of items) {
			itemAmount++;
			orderCost += (item.amount * +item.product.price) as any;
			weight.push(item.amount * +item.product.weight);
		}
		totalCost = deliveryCost + orderCost;
		console.log({
			totalCost,
			deliveryCost,
			orderCost,
			weight,
			range,
		});
	}
	function checkAddress(tag: any) {
		if (address) {
			if (address.name && address.telp && address.value) {
				wait({
					timeout: 250,
					delay: 1016,
					arg: address,
					callback: direction,
				});
			} else {
				disableSubmit = true;
			}
		} else {
			editAddress = true;
		}
	}
	async function direction(address: BuyerClient.Address) {
		try {
			progress.loading();
			disableSubmit = true;
			range = [];
			const stores = new Set<number>();
			for (const item of items) {
				const { id, position } = item.product.store;
				if (stores.has(id)) {
				} else {
					stores.add(id);
					const response = await Map.mbxDirections
						.getDirections({
							profile: 'driving',
							waypoints: [
								{ coordinates: address.position as any },
								{ coordinates: position },
							],
						})
						.send();
					range.push(
						(response.body as Map.Directions).routes.reduce(
							(prev, curr) => prev + curr.distance,
							0
						)
					);
				}
			}
			deliveryCost = Math.round(
				procedure.business.deliveryCostCalculatePerDistance *
					(range.reduce((prev, curr) => prev + curr) / 1000)
			);
			totalCost = deliveryCost + orderCost;
			console.log({
				totalCost,
				deliveryCost,
				orderCost,
				weight,
				range,
			});
			disableSubmit = false;
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
		} finally {
			progress.loaded();
		}
	}
	async function submit() {
		try {
			progress.loading();
			disableSubmit = true;
			if (!address) {
				throw new Error('Alamat tidak terjangkau');
			}
			const result = await client.api.business.order({
				buyer,
				items,
				address,
				range,
				weight,
			});
			snackbar.setText('Berhasil Pesan');
			wait({
				timeout: 1000,
				callback: () => goto('/order', { replaceState: true }),
			});
		} catch (error: any) {
			snackbar.setText(error.message);
			disableSubmit = false;
		} finally {
			snackbar.show();
			progress.loaded();
		}
	}
</script>

<svelte:head>
	<title>Checkout</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:this="{progress}"
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<Appbar
			loading="{$loading}"
			desktop="{$is_desktop}"
			title="Checkout"
			back_nav
		/>
		<main class="main">
			<form id="order" class="form" on:submit|preventDefault="{submit}">
				<section class="section">
					<Address
						bind:data="{address}"
						menu="{addressList}"
						editAll="{editAddress}"
						loader="{$loading}" />
				</section>
				<section class="section">
					{#if items.length}
						<span class="t-2">Daftar Pesanan</span>
					{:else}
						<span class="t-2 loading">&nbsp;</span>
					{/if}
					<section class="subsection">
						{#each items as item}
							<CartCard
								loading="{false}"
								bind:amount="{item.amount}"
								image="{item.product.image}"
								data="{item.product}"
								downloader="{(url) =>
									client.api.product
										.downloadImage(url)
										.then(URL.createObjectURL)}" />
						{/each}
						{#each fakeItems as item}
							<CartCard />
						{/each}
					</section>
				</section>
				{#if buyer}
					<section class="section">
						<span class="t-2">Pengiriman dan Pembayaran</span>
						<section class="subsection t-3 o-7">
							<div class="">Kurir</div>
							<div class="">Bayar Tunai</div>
						</section>
					</section>
					<section class="section">
						<div class="column t-3">
							<span class="o-7">Total Harga ({itemAmount} pesanan)</span>
							<span class="end">Rp. {Currency.toMoney(orderCost)}</span>
						</div>
					</section>
					<section class="section">
						<div class="column t-3">
							<span class="o-7">Total Biaya Pengiriman</span>
							<span class="end">Rp. {Currency.toMoney(deliveryCost)}</span>
						</div>
					</section>
					<section class="section">
						<div class="column t-2">
							<span class="">Total Pembayaran</span>
							<span class="end">Rp. {Currency.toMoney(totalCost)}</span>
						</div>
					</section>
				{:else}
					<section class="section">
						<span class="t-2 loading">&nbsp;</span>
						<section class="subsection">
							<div class="t-3 loading">&nbsp;</div>
							<div class="t-3 loading">&nbsp;</div>
						</section>
					</section>
					<section class="section">
						<span class="t-2 loading">&nbsp;</span>
						<section class="subsection">
							<div class="column">
								<span class="t-2 loading">&nbsp;</span>
								<span class="t-2 loading">&nbsp;</span>
							</div>
							<div class="column">
								<span class="t-2 loading">&nbsp;</span>
								<span class="t-2 loading">&nbsp;</span>
							</div>
						</section>
					</section>
					<section class="section">
						<span class="t-2 loading">&nbsp;</span>
					</section>
				{/if}
			</form>
		</main>
		<Footer class="footer white elevation-5">
			<section class="btn">
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					type="submit"
					form="order"
					disabled="{disableSubmit}">Buat Pesanan</Button>
			</section>
		</Footer>
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
		<Snackbar bind:this="{snackbar}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 32px 16px 16px;
		display: grid;
		color: var(--text-primary-darken);
		@include main;
	}
	.form {
		display: grid;
		row-gap: 24px;
	}
	.textfield {
		height: 48px;
	}
	.t-1 {
		font-size: 20px;
		font-weight: 500;
		line-height: 1.5;
	}
	.t-2 {
		font-size: 18px;
		font-weight: 500;
		line-height: 1.5;
	}
	.t-3 {
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
	}
	.o-7 {
		opacity: 0.74;
	}
	.section {
		display: grid;
		row-gap: 12px;
	}
	.subsection {
		display: grid;
		row-gap: 8px;
	}
	.column {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: 1fr 1fr;
		column-gap: 16px;
		justify-content: space-between;
		.start {
			justify-self: start;
		}
		.end {
			justify-self: end;
		}
	}
	.btn {
		display: grid;
		width: stretch;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-footer;
	}
</style>
