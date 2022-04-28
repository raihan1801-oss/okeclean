<script context="module" lang="ts">
	import { Icon, Chip } from 'svelte-materialify/src';
	import { mdiStorefrontOutline } from '@mdi/js';
	import CartCard from '$components/cart-card.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade } from 'svelte/transition';

	import type { BuyerClient } from '../__layout.svelte';
	import { Currency } from '$lib/helper';
</script>

<script lang="ts">
	export let order:
		| (BuyerClient.Order & {
				store: BuyerClient.Store;
				item: (BuyerClient.OrderedItem & {
					product: BuyerClient.Product;
				})[];
				delivery: BuyerClient.Delivery;
		  })
		| undefined = undefined;
	export let status = false;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
		} catch (error: any) {
		} finally {
		}
	}
	async function release() {}
	export let storeDownload = (url: string) => Promise.resolve(url);
	export let productDownload = (url: string) => Promise.resolve(url);
	export let mode: 'fetch' | 'embed' = 'embed';
	function toMoney(value: any) {
		return 'Rp. ' + Currency.toMoney(value);
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
		border: 2px solid transparent;
		border-radius: 6px;
		transition: all 250ms ease;
		&:hover {
			border: 2px solid var(--primary-color);
		}
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	.bar {
		display: grid;
		grid-template-columns: 1fr 11fr;
		grid-template-rows: auto;
		grid-auto-flow: column;
		align-items: center;
		column-gap: 16px;
		@include medium-only {
			grid-template-columns: 1fr 13fr;
		}
		@include large-only {
			grid-template-columns: 1fr 15fr;
		}
		@include very-large-up {
			grid-template-columns: 1fr 17fr;
		}
	}
	.status {
		grid-template-columns: 1fr 8fr auto;
		@include medium-only {
			grid-template-columns: 1fr 13fr auto;
		}
		@include large-only {
			grid-template-columns: 1fr 15fr auto;
		}
		@include very-large-up {
			grid-template-columns: 1fr 17fr auto;
		}
	}
	.thumb {
		object-fit: cover;
		object-position: center;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 6px;
		&.e {
			display: grid;
			place-items: center;
		}
	}
	.div {
		display: grid;
		row-gap: 24px;
	}
	.section {
		display: grid;
		row-gap: 16px;
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
		align-items: center;
		justify-content: space-between;
		.start {
			justify-self: start;
		}
		.end {
			justify-self: end;
		}
	}
	.hr {
		display: block;
		height: 1px;
		width: stretch;
		background-color: #00000030;
		border: none;
	}
	.textfield {
		min-height: 48px;
	}
	.t-20 {
		font-size: 20px;
		line-height: normal;
	}
	.t-16 {
		font-size: 16px;
		line-height: normal;
	}
	.t-14 {
		font-size: 14px;
		line-height: normal;
	}
	.t-500 {
		font-weight: 500;
	}
	.t-400 {
		font-weight: 400;
	}
	.o-7 {
		opacity: 0.7;
	}
	.o-9 {
		opacity: 0.9;
	}
	.p-16 {
		padding: 16px;
	}
	.p-8 {
		padding: 8px;
	}
	.px-16 {
		padding: {
			left: 16px;
			right: 16px;
		}
	}
	.py-16 {
		padding: {
			top: 16px;
			bottom: 16px;
		}
	}
</style>

<div transition:fade>
	{#if order}
		<a href="/order/{order.id}">
			<div class="card subsection p-8">
				<section class="bar" class:status>
					{#if order.store.image}
						{#if mode == 'embed'}
							<img
								class="thumb"
								src="{order.store.image}"
								alt="{order.store.name}"
							/>
						{:else}
							{#await storeDownload(order.store.image)}
								<div class="thumb loading"></div>
							{:then src}
								<img class="thumb" src="{src}" alt="{order.store.name}" />
							{:catch error}
								<div class="thumb e">
									<Icon path="{mdiStorefrontOutline}" />
								</div>
							{/await}
						{/if}
					{:else}
						<div class="thumb e">
							<Icon path="{mdiStorefrontOutline}" />
						</div>
					{/if}
					<div class="t-14 t-500 o-7">{order.store.name}</div>
					{#if status}
						<Chip label size="small">
							{#if order.status == 'Queue'}
								Menunggu
							{:else if order.status == 'Process'}
								Di Proses
							{:else if order.status == 'Delivery'}
								Di Kirim
							{:else if order.status == 'Confirm'}
								Konfirmasi
							{:else if order.status == 'Done'}
								Selesai
							{:else if order.status == 'Reject'}
								Di Tolak
							{/if}
						</Chip>
					{/if}
				</section>
				<hr class="hr" />
				<section class="subsection">
					{#each order.item as item}
						<CartCard
							control="{false}"
							loading="{false}"
							downloader="{productDownload}"
							image="{item.product.image}"
							amount="{item.amount}"
							data="{{
								name: item.product.name,
								price: item.price,
							}}"
						/>
					{/each}
				</section>
				<hr class="hr" />
				<section class="subsection">
					<div class="t-16 t-500 o-9">Rincian Pembayaran</div>
					<hr class="hr" />
					<section class="subsection">
						<div class="column t-14 t-400">
							<span class="o-7">Metode Pembayaran</span>
							<span class="end">Bayar Tunai</span>
						</div>
						<div class="column t-14 t-400">
							<span class="o-7">Total Harga ({order.item.length} pesanan)</span>
							<span class="end">{toMoney(order.cost)}</span>
						</div>
						<div class="column t-14 t-400">
							<span class="o-7"
								>Biaya Kirim ({Math.round(order.delivery.range)}
								{order.delivery.rangeUnit})</span
							>
							<span class="end">{toMoney(order.delivery.cost)}</span>
						</div>
					</section>
					<hr class="hr" />
					<div class="column t-16 t-500">
						<span class="">Total Bayar</span>
						<span class="end"
							>{toMoney(+order.delivery.cost + +order.cost)}</span
						>
					</div>
				</section>
			</div>
		</a>
	{:else}
		<div class="card subsection p-8">
			<div class="bar">
				<div class="thumb loading">&nbsp;</div>
				<div class="loading">&nbsp;</div>
			</div>
			<hr class="hr" />
			<CartCard />
			<hr class="hr" />
			<section class="section">
				<span class="t-6 loading">&nbsp;</span>
				<section class="subsection t-3">
					<div class="loading">&nbsp;</div>
					<div class="loading">&nbsp;</div>
				</section>
			</section>
			<section class="section">
				<div class="column t-14">
					<span class="loading">&nbsp;</span>
					<span class="loading">&nbsp;</span>
				</div>
			</section>
			<section class="section">
				<div class="column t-14">
					<span class="loading">&nbsp;</span>
					<span class="loading">&nbsp;</span>
				</div>
			</section>
			<section class="section">
				<div class="column t-16">
					<span class="loading">&nbsp;</span>
					<span class="loading">&nbsp;</span>
				</div>
			</section>
		</div>
	{/if}
</div>
