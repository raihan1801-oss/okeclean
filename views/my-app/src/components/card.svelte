<script context="module" lang="ts">
	import { Icon, Card, Ripple } from 'svelte-materialify/src';
	import { mdiImageRemove, mdiImageBrokenVariant } from '@mdi/js';

	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Currency, toMoney } from '$lib/helper';

	interface Data {
		name?: string;
		image?: string;
		price?: any;
		store?: string;
		stock?: number;
	}
</script>

<script lang="ts">
	export let data: Data | undefined = undefined;
	export let highlight: '' | 'price' | 'store' | 'stock' = '';
	export let mode: 'fetch' | 'img' = 'img';
	export let imageLoader = (url: string) => Promise.resolve('');

	$: image = data?.image;

	onMount(init);
	onDestroy(release);
	async function init() {}
	function release() {}
</script>

<style lang="scss">
	@import '../components/skeleton';
	@import '../components/elevation';
	.loading {
		@include loading-sekeleton;
	}
	.card {
		@include elevation;
		display: grid;
		border: 2px solid transparent;
		border-radius: 6px;
		transition: all 250ms ease;
		color: var(--text-primary-darken);
		background-color: white;
		&:hover {
			border: 2px solid var(--primary-color);
		}
		.img {
			object-fit: cover;
			object-position: center;
			width: 100%;
			aspect-ratio: 1;
			background-color: #f5f5f5;
			border-radius: 4px;
			&.e {
				display: grid;
				place-items: center;
				opacity: 0.7;
			}
		}
		.content {
			display: flex;
			flex-flow: column;
			gap: 4px;
			height: 114px;
		}
		.name {
			padding: 8px 8px 0 8px;
			font-weight: 700;
			min-height: 48px;
		}
		.price {
			padding: 0 8px;
			font-size: 14px;
			font-weight: 600;
		}
		.store {
			padding: 0 8px;
			flex-grow: 1;
			font-size: 14px;
			font-weight: 400;
			opacity: 0.7;
		}
		.stock {
			padding: 0 8px;
			font-size: 14px;
			font-weight: 500;
		}
		.highlight {
			padding: 4px;
			background-color: var(--primary-color);
			text-align: center;
		}
		.trunc {
			display: -webkit-box;
			overflow: hidden;
			-webkit-box-orient: vertical;
		}
		.trunc-1 {
			@extend .trunc;
			-webkit-line-clamp: 1;
		}
		.trunc-2 {
			@extend .trunc;
			-webkit-line-clamp: 2;
		}
	}
</style>

<figure class="card" transition:fade use:Ripple="{{}}">
	{#if data}
		{#if mode == 'img'}
			{#if image}
				<img
					class="img"
					src="{image}"
					alt="{data.name}"
					decoding="async"
					async
					on:error="{() => {
						image = undefined;
					}}"
				/>
			{:else}
				<div class="img e">
					<Icon size="{56}" path="{mdiImageRemove}" />
				</div>
			{/if}
		{:else if mode == 'fetch'}
			{#if data.image}
				{#await imageLoader(data.image)}
					<div class="img loading"></div>
				{:then url}
					<img class="img" src="{url}" alt="{data.name}" />
				{:catch e}
					<div class="img e">
						<Icon size="{56}" path="{mdiImageRemove}" />
					</div>
				{/await}
			{:else}
				<div class="img e">
					<Icon size="{56}" path="{mdiImageRemove}" />
				</div>
			{/if}
		{/if}
		<figcaption class="content">
			<div class="name trunc-2">{data.name}</div>
			{#if data.store}
				<div class="store {highlight == 'store' ? 'highlight' : ''} trunc-1">
					{data.store}
				</div>
			{/if}
			<div class="price {highlight == 'price' ? 'highlight' : ''} trunc-1">
				Rp. {Currency.toMoney(data.price)}
			</div>
			{#if data.stock}
				<div class="stock {highlight == 'stock' ? 'highlight' : ''} trunc-1">
					{data.stock} stock
				</div>
			{/if}
		</figcaption>
	{:else}
		<div class="img loading">&nbsp;</div>
		<figcaption class="content">
			<div class="name loading">&nbsp;</div>
			<div class="store loading">&nbsp;</div>
			<div class="price loading">&nbsp;</div>
		</figcaption>
	{/if}
</figure>
