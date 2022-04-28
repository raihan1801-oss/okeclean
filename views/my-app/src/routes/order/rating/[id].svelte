<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Textarea,
		Icon,
		Footer,
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
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import { Currency, wait } from '$lib/helper';

	import type { BuyerClient } from '../../__layout.svelte';

	const title = 'Beri Penilaian';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	const id = +$page.params.id;
	let loader: ProgressLinear;
	let user: BuyerClient.Buyer;
	let order: BuyerClient.Order & {
		store: BuyerClient.Store;
		item: (BuyerClient.OrderedItem & {
			product: BuyerClient.Product;
		})[];
		rating: BuyerClient.Rating | null;
	};
	let stars: string[] = Array(5).fill(mdiStarOutline, 0, 5);
	let comment = '';
	let snackbar: Snackbar;
	let showUserUnauthDialog = false;
	let disable = true;

	$: isLoading = loader?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user = await client.auth();

			order = await client.api.order.search({
				where: {
					AND: [
						{ buyerId: user.id },
						{ id },
						{ status: { in: ['Confirm', 'Done'] } },
					],
				},
				include: {
					store: true,
					rating: true,
					item: { include: { product: true } },
				},
				rejectOnNotFound: true,
			});

			if (order.rating) {
				stars = stars.fill(mdiStar, 0, order.rating.star);
				comment = order.rating.comment;
				throw new Error('Penilaian sudah ada');
			} else {
				disable = false;
			}
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
	async function send() {
		try {
			loader.loading();
			disable = true;
			if (order.rating) {
				throw new Error('Penilaian sudah ada');
			}
			await client.api.rating.create({
				data: {
					star: stars.reduce(
						(prev, curr) => (curr == mdiStar ? (prev += 1) : prev),
						0
					),
					comment,
					buyerId: user.id,
					orderId: order.id,
				},
			});
			snackbar.setText('Terimakasih telah menilai');
			snackbar.show();
			loader.sequencing(1250);
			await wait({ timeout: 1250 });
			goto('/order', { replaceState: true });
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
			disable = false;
		} finally {
			loader.loaded();
		}
	}
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
		object-fit: contain;
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
			<form>
				{#if order}
					<fieldset class="card p-16 subsection white">
						<section class="bar">
							{#if order.store.image}
								<img
									class="thumb loading"
									src="{order.store.image}"
									alt="{order.store.name}"
									on:error="{() => {
										order.store.image = '';
										order = order;
									}}"
								/>
							{:else}
								<div class="thumb e">
									<Icon path="{mdiStorefrontOutline}" />
								</div>
							{/if}
							<div class="t-14">{order.store.name}</div>
						</section>
					</fieldset>
					<fieldset class="card p-16 subsection white">
						<div class="t-14 t-500 o-9">Daftar Pesanan</div>
						<section class="subsection">
							{#each order.item as item}
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
					</fieldset>
					<fieldset class="card section p-16 white">
						<section class="star">
							{#each stars as star, index}
								<div transition:scale>
									<Button
										icon
										text
										on:click="{() => {
											stars = stars
												.fill(mdiStar, 0, index + 1)
												.fill(mdiStarOutline, index + 1);
										}}"
									>
										<Icon
											class="{star == mdiStar ? 'star-full' : ''}"
											path="{star}"
										/>
									</Button>
								</div>
							{/each}
						</section>
						<Textarea rows="{3}" autogrow bind:value="{comment}"
							>Tulis Komentar...</Textarea
						>
					</fieldset>
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
			</form>
		</main>
		<Footer class="white elevation-5">
			<div class="btn">
				{#if order}
					<Button
						class="{disable ? '' : 'primary-color'}"
						disabled="{disable}"
						on:click="{send}">Kirim</Button
					>
				{:else}
					<div class="loading">&nbsp;</div>
				{/if}
			</div>
		</Footer>
		<Snackbar bind:this="{snackbar}" />
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>
