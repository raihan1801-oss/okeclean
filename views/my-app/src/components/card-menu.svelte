<script context="module" lang="ts">
	import { Icon, Ripple } from "svelte-materialify/src";
	import { mdiImageRemove } from "@mdi/js";

	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";

	interface Data {
		name?: string;
		image?: string;
		is_ready?: boolean;
	}
</script>

<script lang="ts">
	export let data: Data | undefined = undefined;
	export let mode: "fetch" | "img" = "img";
	export let imageLoader = (url: string) => Promise.resolve("");
	export let extra_image = "";

	$: image = data?.image;

	onMount(init);
	onDestroy(release);
	async function init() {}
	function release() {}
</script>

<figure class="card" transition:fade use:Ripple={{}}>
	{#if data}
		{#if !data.is_ready}
			<img
				class="extra-image"
				decoding="async"
				async
				src={extra_image}
				alt=""
			/>
		{/if}
		{#if mode == "img"}
			{#if image}
				<img
					class="img"
					src={image}
					alt={data.name}
					decoding="async"
					async
					on:error={() => {
						image = undefined;
					}}
				/>
			{:else}
				<div class="img e">
					<Icon size={56} path={mdiImageRemove} />
				</div>
			{/if}
		{:else if mode == "fetch"}
			{#if data.image}
				{#await imageLoader(data.image)}
					<div class="img loading" />
				{:then url}
					<img class="img" src={url} alt={data.name} />
				{:catch e}
					<div class="img e">
						<Icon size={56} path={mdiImageRemove} />
					</div>
				{/await}
			{:else}
				<div class="img e">
					<Icon size={56} path={mdiImageRemove} />
				</div>
			{/if}
		{/if}
		<figcaption class="content">
			<div class="name trunc-2">{data.name}</div>
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

<style lang="scss">
	@import "../components/skeleton";
	@import "../components/elevation";
	.loading {
		@include loading-sekeleton;
	}
	.card {
		@include elevation;
		display: grid;
		position: relative;
		padding: 16px;
		border: 2px solid transparent;
		border-radius: 24px;
		transition: all 250ms ease;
		color: black;
		background-color: white;
		gap: 8px;
		&:hover {
			border: 2px solid var(--primary-color);
		}
		.img {
			width: 100%;
			aspect-ratio: 1;
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
			text-align: center;
		}
		.name {
			font-weight: 700;
		}
		.store {
			padding: 0 8px;
			flex-grow: 1;
			font-size: 14px;
			font-weight: 400;
			opacity: 0.7;
		}
		.extra-image {
			position: absolute;
			right: 0;
			top: 0;
			width: 50%;
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
