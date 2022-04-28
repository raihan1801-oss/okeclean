<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Textarea,
		Icon,
	} from 'svelte-materialify/src';
	import {
		mdiChevronLeft,
		mdiStarOutline,
		mdiStar,
		mdiStorefrontOutline,
	} from '@mdi/js';
	import ProgressLinear from '$components/progress-linear.svelte';
	import CartCard from '$components/cart-card.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, slide, scale } from 'svelte/transition';

	import type { BuyerClient } from '../../__layout.svelte';

	const title = 'Daftar Penilaian';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	let loader: ProgressLinear;
	let user: BuyerClient.Buyer;
	let rating: (BuyerClient.Rating & {
		order: BuyerClient.Order & {
			store: BuyerClient.Store;
			item: (BuyerClient.OrderedItem & {
				product: BuyerClient.Product;
			})[];
		};
	})[] = [];
	let stars: string[] = Array(5).fill(mdiStarOutline, 0, 5);
	let snackbar: Snackbar;
	let showUserUnauthDialog = false;

	$: isLoading = loader?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user = await client.auth();

			rating = await client.api.rating.searchMany({
				where: {
					buyerId: user.id,
				},
				include: {
					order: {
						include: {
							store: true,
							item: {
								include: {
									product: true,
								},
							},
						},
					},
				},
			});
		} catch (error: any) {
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
</script>

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
	fieldset {
		border: none;
	}
	.bar {
		display: grid;
		grid-template-columns: 1fr 11fr;
		grid-template-rows: auto;
		grid-auto-flow: column;
		align-items: center;
		column-gap: 16px;
		@include medium-up {
			grid-template-columns: 1fr 21fr;
		}
	}
	.star {
		display: flex;
		justify-content: center;
		column-gap: 4px;
	}
	.btn {
		width: stretch;
		height: stretch;
		display: grid;
		grid-template-columns: minmax(44px, 1fr);
		grid-template-rows: minmax(44px, auto);
		grid-auto-flow: column;
		align-items: center;
		column-gap: 8px;
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

	* :global {
		@include common-loader;
		@include common-app {
			background-color: #f7f7f7;
		}
		@include common-appbar;
		@include common-footer;
		.star-full {
			color: #ffcc00;
		}
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
			{#each rating as item}
				<section class="card section p-16 white">
					<section class="subsection">
						<section class="bar">
							{#if item.order.store.image}
								<img
									class="thumb loading"
									src="{item.order.store.image}"
									alt="{item.order.store.name}"
									on:error="{() => {
										item.order.store.image = '';
										item = item;
									}}"
								/>
							{:else}
								<div class="thumb e">
									<Icon path="{mdiStorefrontOutline}" />
								</div>
							{/if}
							<div class="t-14">{item.order.store.name}</div>
						</section>
					</section>
					<hr class="hr" />
					<section class="subsection">
						<div class="t-14 t-500 o-9">Daftar Pesanan</div>
						<section class="subsection">
							{#each item.order.item as item}
								<CartCard
									outlined
									dense
									control="{false}"
									loading="{false}"
									image="{item.product.image}"
									amount="{item.amount}"
									data="{{
										name: item.product.name,
										price: item.price,
									}}"
								/>
							{/each}
						</section>
					</section>
					<hr class="hr" />
					<section class="subsection">
						<section class="star">
							{#each stars.slice().fill(mdiStar, 0, item.star) as star}
								<div transition:scale>
									<Icon
										class="{star == mdiStar ? 'star-full' : ''}"
										path="{star}"
									/>
								</div>
							{/each}
						</section>
						<Textarea rows="{3}" autogrow value="{item.comment}" readonly
							>Komentar</Textarea
						>
					</section>
				</section>
			{/each}
		</main>
		<Snackbar bind:this="{snackbar}" />
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>
