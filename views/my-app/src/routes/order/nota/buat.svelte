<script context="module" lang="ts">
	import { MaterialAppMin, Footer, Button, Radio } from 'svelte-materialify/src';
	import CartCard from '$components/cart-card.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';
	import Calendar from '$components/calendar.svelte';
	import ProgressLinear from '$components/progress-linear.svelte';
	import Appbar from '../../_appbar.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { session } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Currency, wait } from '$lib/helper';

	import type { ObserverUnsafe } from '$lib/helper';
	import type { BuyerClient } from '../../__layout.svelte';

	const title = 'Pemesanan';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	let checkout = $session.checkout;
	let user_login: BuyerClient.User;
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
	let metode_pembayaran = 0;
	let editAddress = false;
	let showUserUnauthDialog = false;
	let disable_finish = true;
	let disable_cancel = true;

	$: loading = progress?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user_login = await client.api.user.auth();

			if (!checkout) {
				throw Error('Something Wrong');
			}

			disable_finish = false;
			disable_cancel = false;
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
	async function finish() {
		try {
			progress.loading();
			disable_finish = true;

			if (checkout) {
				const data = await client.api.transaction.create({
					data: checkout,
					cost: checkout.total_cost,
					created_by: user_login.id,
					name: ''
				});
				checkout.id = data.id;
			} else {
				throw Error('Something Wrong');
			}

			snackbar.setText('Berhasil Pesan');
		} catch (error: any) {
			snackbar.setText(error.message);
			disable_finish = false;
		} finally {
			snackbar.show();
			progress.loaded();
		}
	}
	async function cancel() {
		try {
			progress.loading();
			disable_finish = true;
			disable_cancel = true;

			if (checkout?.id) {
				await client.api.transaction.cancel({
					id: checkout.id
				});
			} else {
				throw Error('Something Wrong');
			}

			snackbar.setText('Pelayanan Batal');
		} catch (error: any) {
			snackbar.setText(error.message);
			disable_cancel = false;
		} finally {
			snackbar.show();
			progress.loaded();
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:this={progress}
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<Appbar loading={$loading} desktop={$is_desktop} {title} back_nav />
		<main class="main">
			<form id="order" class="form" on:submit|preventDefault={finish}>
				{#if checkout}
					<section class="section pad card">
						<section class="subsection">
							<h3 class="t-3">Dalam Proses</h3>
							<section class="sub2section">
								<h4 class="t-4">ID</h4>
								<div>{checkout.id || '----'}</div>
							</section>
							<section class="sub2section">
								<h4 class="t-4">Alamat</h4>
								<div>{checkout.address.name}</div>
							</section>
							<section class="sub2section">
								<h4 class="t-4">Waktu</h4>
								<div>{checkout.datetime.name}</div>
							</section>
							<section>
								<h4 class="t-4">Layanan</h4>
								{#each Object.entries(checkout.service) as [key, item]}
									<section class="column">
										<div class="start">{item.name}</div>
										<div class="end">Rp. {Currency.toMoney(item.cost)}</div>
									</section>
								{/each}
							</section>
							<section class="sub2section">
								<h4 class="t-4">Metode Pembayaran</h4>
								<div>{checkout.payment_method.name}</div>
							</section>
							<hr class="hr" />
							<section class="column">
								<div class="start t-3">Total</div>
								<div class="end">
									Rp. {Currency.toMoney(checkout.total_cost)}
								</div>
							</section>
						</section>
					</section>
					<section class="section pad card btns">
						<Button
							type="submit"
							size="large"
							class={disable_finish ? '' : 'primary-color'}
							disabled={disable_finish}>Pesan</Button
						>
						<Button
							type="button"
							size="large"
							class={disable_cancel ? '' : 'error-color'}
							disabled={disable_cancel}
							on:click={cancel}>Batal</Button
						>
					</section>
				{:else}
					<section class="section pad card">
						{#each Array(4) as item}
							<section class="subsection">
								<h3 class="t-1 loading">----</h3>
								<section>
									<h4 class="t-2 loading">----</h4>
								</section>
							</section>
						{/each}
					</section>
				{/if}
			</form>
		</main>
		<UserUnauthDialog bind:active={showUserUnauthDialog} />
		<Snackbar bind:this={snackbar} />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../../components/common';
	@import '../../../components/elevation';
	@import '../../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 32px 16px 16px;
		display: grid;
		@include main;
	}
	.form {
		display: flex;
		flex-flow: column;
		row-gap: 24px;
	}
	.section {
		display: grid;
		row-gap: 16px;
		&.pad {
			padding: 12px 20px;
		}
	}
	.subsection {
		display: grid;
		row-gap: 8px;
	}
	.sub2section {
		display: grid;
		row-gap: 4px;
	}
	.card {
		@include elevation;
		border-radius: 6px;
	}
	.textfield {
		height: 48px;
	}
	.t-1 {
		font-size: 24px;
		font-weight: 500;
		line-height: normal;
	}
	.t-2 {
		font-size: 20px;
		font-weight: 500;
		line-height: normal;
		opacity: 0.9;
	}
	.t-3 {
		font-size: 18px;
		font-weight: 500;
		line-height: normal;
	}
	.t-4 {
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		opacity: 0.8;
	}
	.o-7 {
		opacity: 0.74;
	}
	.flex {
		display: flex;
		gap: 16px;
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
	.hr {
		display: block;
		height: 1px;
		width: stretch;
		background-color: #00000030;
		border: none;
	}
	.btns {
		display: grid;
		grid-auto-flow: column;
		gap: 16px;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-footer;
	}
</style>
