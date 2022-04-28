<script context="module" lang="ts">
	import {
		TextField,
		Textarea,
		Chip,
	} from 'svelte-materialify/src';
	import CartCard from '$components/cart-card.svelte';

	import { Currency } from '$lib/helper';

	import type { BuyerClient } from '../__layout.svelte';
</script>

<script lang="ts">
	export let order:
		| (BuyerClient.Order & {
				item: (BuyerClient.OrderedItem & {
					product: BuyerClient.Product;
				})[];
				delivery: BuyerClient.Delivery & {
					recipient: BuyerClient.Address;
					sender: BuyerClient.Store;
					courier: BuyerClient.Courier | null;
				};
		  })
		| undefined = undefined;
	export let downloader = (url: string) => Promise.resolve('');
	function toDate(value: any) {
		if (value) {
			return new Date(value).toLocaleString();
		} else {
			return '---';
		}
	}
	function toMoney(value: any) {
		return 'Rp. ' + Currency.toMoney(value);
	}
</script>

{#if order}
	<fieldset class="card p-16 section white">
		<section class="column">
			<div class="t-16 t-500 o-9">Pesanan</div>
			<div class="end">
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
						Ditolak
					{/if}
				</Chip>
			</div>
		</section>
		<hr class="hr" />
		<section class="subsection">
			<div class="column t-14 t-400">
				<span class="o-7">Tanggal Buat</span>
				<span class="end">{toDate(order.createOn)}</span>
			</div>
			<div class="column t-14 t-400">
				<span class="o-7">Tanggal Selesai</span>
				<span class="end">{toDate(order.finishOn)}</span>
			</div>
		</section>
	</fieldset>
	<fieldset class="card p-16 section white">
		<div class="column">
			<div class="t-16 t-500 o-9">Pengiriman</div>
			<div class="end">
				<Chip label size="small">
					{#if order.delivery.status == 'Queue'}
						Menunggu
					{:else if order.delivery.status == 'Process'}
						ke Pengirim
					{:else if order.delivery.status == 'Delivery'}
						ke Penerima
					{:else if order.delivery.status == 'Confirm'}
						Sampai
					{:else if order.delivery.status == 'Done'}
						Selesai
					{:else if order.delivery.status == 'Reject'}
						Ditolak
					{/if}
				</Chip>
			</div>
		</div>
		<hr class="hr" />
		<section class="subsection">
			<div class="column t-14 t-400">
				<span class="o-7">Tanggal Kirim</span>
				<span class="end">{toDate(order.delivery.sentOn)}</span>
			</div>
			<div class="column t-14 t-400">
				<span class="o-7">Tanggal Terima</span>
				<span class="end">{toDate(order.delivery.receiveOn)}</span>
			</div>
		</section>
	</fieldset>
	<fieldset class="card div p-16 white">
		<div class="t-16 t-500 o-9">Penerima</div>
		<section class="section">
			<TextField
				value="{order.delivery.recipient.name ?? ''}"
				readonly
				placeholder="-">Nama</TextField>
			<TextField
				value="{order.delivery.recipient.telp ?? ''}"
				readonly
				placeholder="-">Phone Number</TextField>
			<Textarea
				value="{order.delivery.recipient.value}"
				readonly
				placeholder="-"
				autogrow
				rows="{3}">Alamat</Textarea>
		</section>
	</fieldset>
	<fieldset class="card div p-16 white">
		<div class="t-16 t-500 o-9">Pengirim</div>
		<section class="section">
			<TextField value="{order.delivery.sender.name}" readonly placeholder="-"
				>Nama Toko</TextField>
			<TextField value="{''}" readonly placeholder="-">Phone Number</TextField>
			<Textarea
				value="{order.delivery.sender.address}"
				readonly
				placeholder="-"
				autogrow
				rows="{3}">Alamat Toko</Textarea>
		</section>
	</fieldset>
	{#if order.delivery.courier}
		<fieldset class="card div p-16 white">
			<div class="t-16 t-500 o-9">Kurir</div>
			<section class="section">
				<TextField
					value="{order.delivery.courier.name ?? ''}"
					readonly
					placeholder="-">Nama</TextField>
				<TextField
					value="{order.delivery.courier.telp ?? ''}"
					readonly
					placeholder="-">Phone Number</TextField>
				<Textarea
					value="{order.delivery.courier.address ?? ''}"
					readonly
					placeholder="-"
					autogrow
					rows="{3}">Lokasi</Textarea>
			</section>
		</fieldset>
	{/if}
	<fieldset class="card p-16 white">
		<div class="t-16 t-500 o-9">Daftar Pesanan</div>
		<section class="section">
			{#each order.item as item}
				<CartCard
					outlined
					control="{false}"
					loading="{false}"
					downloader="{downloader}"
					image="{item.product.image}"
					amount="{item.amount}"
					data="{{
						name: item.product.name,
						price: item.price,
					}}" />
			{/each}
		</section>
	</fieldset>
	<fieldset class="card p-16 section white">
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
					{order.delivery.rangeUnit})</span>
				<span class="end">{toMoney(order.delivery.cost)}</span>
			</div>
		</section>
		<hr class="hr" />
		<div class="column t-16 t-500">
			<span class="">Total Bayar</span>
			<span class="end">{toMoney(+order.delivery.cost + +order.cost)}</span>
		</div>
	</fieldset>
{:else}
	<fieldset class="card p-16 white section">
		<div class="t-16 loading">&nbsp;</div>
		<section class="section">
			<div class="textfield loading">&nbsp;</div>
			<div class="textfield loading">&nbsp;</div>
		</section>
	</fieldset>
	<fieldset class="card p-16 white section">
		<div class="t-16 loading">&nbsp;</div>
		<section class="section">
			<div class="textfield loading">&nbsp;</div>
			<div class="textfield loading">&nbsp;</div>
		</section>
	</fieldset>
	<fieldset class="card p-16 white">
		<div class="t-16 loading">&nbsp;</div>
		<section class="section">
			{#each Array(2) as item}
				<CartCard />
			{/each}
		</section>
	</fieldset>
	<fieldset class="card p-16 white">
		<section class="section">
			<div class="t-16 loading">&nbsp;</div>
			<section class="subsection t-16">
				<div class="loading">&nbsp;</div>
				<div class="loading">&nbsp;</div>
			</section>
		</section>
		<section class="section">
			<div class="column t-16">
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
		<section class="section">
			<div class="column t-16">
				<span class="loading">&nbsp;</span>
				<span class="loading">&nbsp;</span>
			</div>
		</section>
	</fieldset>
{/if}

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
	}
	form {
		display: grid;
		row-gap: 24px;
	}
	fieldset {
		border: none;
		display: grid;
		row-gap: 8px;
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
