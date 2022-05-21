<script context="module" lang="ts">
	import { MaterialAppMin } from 'svelte-materialify/src';
	import Appbar from './_appbar.svelte';
	import Footer from './_footer.svelte';
	import Carousel from './_carousel.svelte';
	import Cards from '$components/cards.svelte';
	import Card from '$components/card.svelte';
	import CardMenu from '$components/card-menu.svelte';
	import PwaSnack from './_pwa-snack.svelte';
	// import Featured from "./_featured.svelte";
	import ProgressLinear from '$components/progress-linear.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getImageUrl, ObserverUnsafe, wait } from '$lib/helper';

	// import src1 from "$static/daily.svg";
	// import src2 from "$static/disinfectan.svg";
	// import src3 from "$static/general.svg";
	// import comingsoon from "$static/comingsoon.svg";

	import type { BuyerClient, Service } from './__layout.svelte';
	import { goto } from '$app/navigation';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	const service = getContext<Service>('service');
	const data_menu = [
		{
			name: 'Daily Cleaning',
			image: 'daily.svg',
			is_ready: true,
			href: 'checkout/step-1'
		},
		{
			name: 'Disinfectan Cleaning',
			image: 'disinfectan.svg',
			is_ready: false,
			href: ''
		},
		{
			name: 'General Cleaning',
			image: 'general.svg',
			is_ready: false,
			href: ''
		}
	];

	let user_login: BuyerClient.User;
	let product: (BuyerClient.Product & { store: BuyerClient.Store })[] = [];
	let searchResult: (BuyerClient.Product & { store: BuyerClient.Store })[] = [];
	let slides: { src: string; href: string }[] = [];
	let fakeData = Array(6);
	let progress: ProgressLinear;
	let pwa_snack: PwaSnack;
	let mode: 'search' | 'display' = 'display';
	let searchText = '';

	$: loading = progress?.active;

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;

			const slides_feature = await client.api.feature.get({ name: 'slides' });
			slides = slides_feature.data as any;
			fakeData = Array(0);

			client.api.user
				.auth()
				.then(async (user) => {
					user_login = user;
					await service.register('/service-worker.js', {
						prevent_prompt: true,
						install_found: () => {
							pwa_snack.$set({ state: 'install', show: true });
							pwa_snack.$on('click', () => {
								service.prompt();
							});
						},
						update_found: () => {
							pwa_snack.$set({ state: 'update', show: true });
							pwa_snack.$on('click', () => {
								service.update();
							});
						}
					});
				})
				.catch(async (reason) => {
					await service.unregister();
				});
		} catch (error: any) {
			throw error;
		} finally {
			progress.loaded();
		}
	}
	async function release() {}
</script>

<svelte:head>
	<title>Beranda Oke Clean</title>
	<meta name="description" content="beranda oke clean, menyediakan jasa pembersihan rumah" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:this={progress}
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<Appbar loading={$loading} desktop={$is_desktop} />
		<Carousel desktop={$is_desktop} {slides} />
		<main class="main">
			<Cards px={$is_desktop ? 44 : 16}>
				{#each data_menu as data}
					{#if data.is_ready}
						<a href={data.href}>
							<CardMenu {data} imageLoader={getImageUrl} extra_image="comingsoon.svg" />
						</a>
					{:else}
						<CardMenu {data} imageLoader={getImageUrl} extra_image="comingsoon.svg" />
					{/if}
				{/each}
			</Cards>
			<!-- <Featured
				layout={$is_desktop ? "column" : "row"}
				px={$is_desktop ? 44 : 16}
				gap={24}
			/> -->
		</main>
		<Footer desktop={$is_desktop} />
		<PwaSnack bind:this={pwa_snack} />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../components/common';
	.main {
		padding: 16px 0;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: 100%;
		align-content: start;
		gap: 16px;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	* :global {
		@include common-app;
		@include common-loader;
	}
</style>
