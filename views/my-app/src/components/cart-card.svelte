<script context="module" lang="ts">
	import TopBar from '$components/top-bar.svelte';
	import BottomBar from '$components/bottom-bar.svelte';
	import {
		Button,
		Icon,
		Checkbox,
		Snackbar,
		Alert,
		TextField,
		Textarea,
		ListItemGroup,
		ListItem,
		Menu,
	} from 'svelte-materialify/src';
	import {
		mdiChevronLeft,
		mdiMapMarkerRadiusOutline,
		mdiClose,
		mdiPlus,
		mdiMinus,
		mdiMapMarker,
		mdiImageRemove,
	} from '@mdi/js';
	import { getContext, onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { browser } from '$app/env';
	import { Currency } from '$lib/helper';

	interface Selected {
		name?: string;
		price?: any;
	}
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let outlined = false;
	export let data: Selected = {};
	export let amount: number = 1;
	export let image = '';
	export let mode: 'fetch' | 'img' = 'img';
	export let control = true;
	export let loading = true;
	export let price = true;
	export let dense = false;
	export let downloader = (src: string) => Promise.resolve('');

	onMount(init);
	onDestroy(release);
	async function init() {}
	async function release() {}
	function toMoney(value: any) {
		return 'Rp. ' + Currency.toMoney(value);
	}
</script>

<figure class="card {classname}" class:outlined class:dense transition:fade>
	{#if image}
		{#if mode == 'img'}
			<img
				class="thumb"
				src="{image}"
				alt="{data.name}"
				on:error="{() => {
					image = '';
				}}" />
		{:else}
			{#await downloader(image)}
				<div class="thumb loading"></div>
			{:then src}
				<img class="thumb" src="{src}" alt="{data.name}" />
			{:catch error}
				<div class="thumb e">
					<Icon path="{mdiImageRemove}" />
				</div>
			{/await}
		{/if}
	{:else if loading}
		<div class="thumb loading">&nbsp;</div>
	{:else}
		<div class="thumb e">
			<Icon path="{mdiImageRemove}" />
		</div>
	{/if}
	<figcaption class="caption {loading ? 'spacing' : ''}">
		{#if loading}
			<div class="name loading">&nbsp;</div>
			<div class="price loading">&nbsp;</div>
			<div class="counter loading">&nbsp;</div>
		{:else}
			<div class="name">{data.name ?? '&nbsp;'}</div>
			{#if dense == false}
				{#if control}
					<div class="price t-500">
						{data.price ? toMoney(data.price) : '&nbsp;'}
					</div>
					<div class="counter">
						<Button
							outlined
							icon
							size="x-small"
							on:click="{() => {
								amount > 1 ? amount-- : null;
							}}">
							<Icon path="{mdiMinus}" size="{16}" />
						</Button>
						<span>{amount}</span>
						<Button
							outlined
							icon
							size="x-small"
							on:click="{() => {
								amount++;
							}}">
							<Icon path="{mdiPlus}" size="{16}" />
						</Button>
					</div>
				{:else if price}
					<div class="price t-400 o-7">
						{amount} x {data.price ? toMoney(data.price) : '&nbsp;'}
					</div>
					<div class="price t-500">{toMoney(amount * +data.price)}</div>
				{:else}
					<div></div>
				{/if}
			{/if}
		{/if}
	</figcaption>
</figure>

<style lang="scss">
	@import './skeleton';
	@import './common';
	.loading {
		@include loading-sekeleton;
	}
	.outlined {
		padding: 8px;
		border: 1px solid #00000030;
		border-radius: 6px;
	}
	.card {
		display: grid;
		column-gap: 16px;
		grid-auto-flow: column;
		color: var(--text-primary-darken);
		@include very-small-only {
			grid-template-columns: 1fr 1fr;
		}
		@include small-only {
			grid-template-columns: 1fr 3fr;
		}
		@include medium-only {
			grid-template-columns: 1fr 5fr;
		}
		@include large-only {
			grid-template-columns: 1fr 7fr;
		}
		@include very-large-only {
			grid-template-columns: 1fr 11fr;
		}
	}
	.dense {
		@include very-small-only {
			grid-template-columns: 1fr 1fr;
		}
		@include small-only {
			grid-template-columns: 1fr 5fr;
		}
		@include medium-only {
			grid-template-columns: 1fr 7fr;
		}
		@include large-only {
			grid-template-columns: 1fr 9fr;
		}
		@include very-large-only {
			grid-template-columns: 1fr 11fr;
		}
	}
	.caption {
		display: grid;
		align-content: space-around;
	}
	.spacing {
		gap: 4px;
	}
	.name {
		line-height: normal;
		text-transform: capitalize;
		font-size: 16px;
		font-weight: 400;
	}
	.price {
		line-height: normal;
		font-size: 14.8px;
	}
	.t-400 {
		font-weight: 400;
	}
	.t-500 {
		font-weight: 500;
	}
	.o-7 {
		opacity: 0.7;
	}
	.thumb {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		object-position: center;
		background-color: #efefef;
		border-radius: 6px;
		&.e {
			display: grid;
			place-items: center;
		}
	}
	.counter {
		display: flex;
		column-gap: 8px;
		align-items: center;
		:global(.s-btn.outlined) {
			border-width: 2px;
		}
		span {
			font-size: 14.8px;
			font-weight: 500;
			padding: 0 8px;
			border-left: 2px var(--text-primary-darken) solid;
			border-right: 2px var(--text-primary-darken) solid;
		}
	}
</style>
