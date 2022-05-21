<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Footer,
		Button,
		Icon,
		Menu,
		NavigationDrawer,
		Avatar,
		List,
		ListGroup,
		ListItem,
		ListItemGroup,
		Card,
		Badge,
		Divider,
		TextField,
		Checkbox,
		Ripple
	} from 'svelte-materialify/src';
	import {
		mdiAccountOutline,
		mdiClipboardListOutline,
		mdiBellOutline,
		mdiTagOutline,
		mdiLogout,
		mdiAccountCircle,
		mdiMapMarkerRadiusOutline,
		mdiCheck,
		mdiEyeOff,
		mdiEye,
		mdiStorefrontOutline,
		mdiDeleteOutline,
		mdiChevronLeft,
		mdiChevronRight,
		mdiAccountCircleOutline,
		mdiCogOutline,
		mdiSync,
		mdiTruckDeliveryOutline,
		mdiStarOutline,
		mdiMenu,
		mdiViewDashboardOutline,
		mdiDotsVertical,
		mdiViewGridOutline,
		mdiClipboardTextOutline,
		mdiClipboardTextMultipleOutline,
		mdiCached,
		mdiTruckOutline,
		mdiCubeOutline,
		mdiFishbowlOutline,
		mdiRefresh,
		mdiMinus,
		mdiPlus
	} from '@mdi/js';
	import { mdiClipboardTextClockOutline } from '$lib/icons';
	import ProgressLinear from '$components/progress-linear.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import Appbar from '../_appbar.svelte';

	import { Currency } from '$lib/helper';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { session } from '$app/stores';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';

	import type { BuyerClient } from '../__layout.svelte';
	import type { ObserverUnsafe } from '$lib/helper';

	const title = 'Daily Cleaning';
</script>

<script lang="ts">
	interface DailyCleaningFeature {
		building_areas: {
			hour: number;
			cost: number;
		}[];
		job_details: {
			name: string;
			image: string;
			image_file: object;
			count: number;
		}[];
	}

	const client = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	const jenis_kelamin = [{ name: 'Laki-laki' }, { name: 'Prempuan' }];
	let luas_bangunan = [
		{ hour: 2, cost: 130_000 },
		{ hour: 3, cost: 195_000 },
		{ hour: 4, cost: 260_000 },
		{ hour: 5, cost: 325_000 },
		{ hour: 6, cost: 390_000 }
	];
	let detail_pekerjaan = [
		{ name: 'Bed Room', image: 'bedroom.svg', count: 1 },
		{ name: 'Bath Room', image: 'bedroom.svg', count: 1 },
		{ name: 'Kitchen', image: 'bedroom.svg', count: 1 },
		{ name: 'Other Room', image: 'bedroom.svg', count: 1 },
		{ name: 'Terrace', image: 'bedroom.svg', count: 1 }
	];
	let daily_cleaning: BuyerClient.Feature;
	let luas_bangunan_terpilih = 0;
	let jenis_kelamin_terpilih = 0;
	let user_login: BuyerClient.User;
	let progress: ProgressLinear;
	let snackbar: Snackbar;
	let showUserUnauthDialog = false;
	let total_cost = 0;

	$: loading = progress?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;

			user_login = await client.api.user.auth();
			daily_cleaning = await client.api.feature.get({
				name: 'daily-cleaning'
			});
			luas_bangunan = (daily_cleaning.data as unknown as DailyCleaningFeature).building_areas;
			detail_pekerjaan = (daily_cleaning.data as unknown as DailyCleaningFeature).job_details;
			total_cost = luas_bangunan[luas_bangunan_terpilih].cost;
			for (const iterator of detail_pekerjaan) {
				total_cost += iterator.count * 20_000;
			}
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
	async function submit() {
		try {
			progress.loading();
			$session = {
				splashed: false,
				checkout: {
					id: 0,
					status: 'wait',
					address: { coord: [0, 0], name: '' },
					datetime: { timestamp: 0, name: '' },
					payment_method: { name: '' },
					service: {
						daily_cleaning: {
							name: 'Daily Cleaning',
							building_area: luas_bangunan[luas_bangunan_terpilih],
							job_details: detail_pekerjaan,
							gender: jenis_kelamin[jenis_kelamin_terpilih],
							cost: total_cost
						}
					},
					services: ['Daily Cleaning'],
					total_cost: total_cost
				}
			};
			goto('step-2', { replaceState: true });
		} catch (error: any) {
		} finally {
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
		<Appbar loading={$loading} desktop={$is_desktop} title="Daily Cleaning" back_nav />
		<main class="main">
			<form class="section" on:submit|preventDefault={submit}>
				<h2 class="t-2">Pilih Layanan</h2>
				<section class="card subsection">
					<h3 class="t-3">Durasi Pekerjaan</h3>
					<ul class="l-card">
						{#if !user_login}
							{#each Array(6) as item}
								<li>
									<button type="button" class="subcard m-1 loading">
										<div>1 Jam</div>
										<div>Rp.1.000</div>
									</button>
								</li>
							{/each}
						{:else}
							{#each luas_bangunan as item, index}
								<li>
									<button
										type="button"
										class="subcard m-1 {luas_bangunan_terpilih == index ? 'active' : ''}"
										on:click={(event) => {
											luas_bangunan_terpilih = index;
											total_cost = luas_bangunan[luas_bangunan_terpilih].cost;
											for (const iterator of detail_pekerjaan) {
												total_cost += iterator.count * 20_000;
											}
										}}
									>
										<div>{item.hour} Jam</div>
										<div>
											Rp. {Currency.toMoney(item.cost)}
										</div>
									</button>
								</li>
							{/each}
						{/if}
					</ul>
				</section>
				<section class="card subsection">
					<h3 class="t-3">Detail Pekerjaan</h3>
					<ul class="l-card">
						{#if !user_login}
							{#each Array(6) as item}
								<li class="subcard m-1 loading">
									<div class="thumb" />
									<div>Ruangan</div>
									<div class="action">
										<div>1</div>
									</div>
								</li>
							{/each}
						{:else}
							{#each detail_pekerjaan as item}
								<li class="subcard m-1">
									<img src={item.image} alt="" class="thumb" />
									<div>{item.name}</div>
									<div class="action">
										<button
											type="button"
											class="square"
											use:Ripple={{}}
											on:click={() => {
												if (item.count > 0) {
													item.count--;
													total_cost -= 20_000;
													item = item;
												}
											}}
										>
											<Icon path={mdiMinus} />
										</button>
										<div>{item.count}</div>
										<button
											type="button"
											class="square"
											use:Ripple={{}}
											on:click={() => {
												if (item.count < 100) {
													item.count++;
													total_cost += 20_000;
													item = item;
												}
											}}
										>
											<Icon path={mdiPlus} />
										</button>
									</div>
								</li>
							{/each}
						{/if}
					</ul>
				</section>
				<!-- <section class="card subsection">
					<h3 class="t-3">Pekerja</h3>
					<ul class="l-card">
						{#each jenis_kelamin as item, index}
							<li>
								<button
									type="button"
									class="subcard m-1 {jenis_kelamin_terpilih == index ? 'active' : ''}"
									on:click={(event) => {
										jenis_kelamin_terpilih = index;
									}}
								>
									<span>{item.name}</span>
									<Icon path={mdiChevronRight} />
								</button>
							</li>
						{/each}
					</ul>
				</section> -->
				<section class="subsection card submit">
					<h3 class="t-3">Total Biaya</h3>
					<div>
						Rp. {Currency.toMoney(total_cost)}
					</div>
					<Button type="submit" size="large" class="primary-color">Selanjutnya</Button>
				</section>
			</form>
		</main>
		<UserUnauthDialog bind:active={showUserUnauthDialog} />
		<Snackbar bind:this={snackbar} />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	@import '../../components/elevation';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 24px 16px;
		display: grid;
		align-content: start;
		row-gap: 16px;
		@include main;
	}
	.l-card {
		display: flex;
		flex-flow: row wrap;
		gap: 8px;
	}
	.card {
		@include elevation;
		border-radius: 6px;
	}
	.subcard {
		@include card-default;
		width: max-content;
		background-color: white;
		&:hover {
			background-color: #f9f9f9;
		}
		&.m-1 {
			padding: 8px 16px;
			text-align: center;
		}
		&.active {
			background-color: var(--primary-color);
		}
	}
	.action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		button {
			display: grid;
		}
	}
	.square {
		border-radius: 4px;
		border: 2px var(--primary-color) solid;
	}
	.thumb {
		width: 92px;
		height: 92px;
		border-radius: 2px;
	}
	.t-1 {
		font-size: 20px;
		font-weight: 500;
		line-height: normal;
	}
	.t-2 {
		font-size: 16px;
		font-weight: 500;
		line-height: normal;
		opacity: 0.9;
	}
	.t-3 {
		font-size: 14px;
		font-weight: 400;
		line-height: normal;
		opacity: 0.7;
	}
	.section {
		display: grid;
		row-gap: 16px;
	}
	.subsection {
		padding: 8px 16px;
		display: grid;
		row-gap: 8px;
	}
	.submit {
		@include btn-default;
	}
	ul {
		list-style: none;
		padding-left: 0;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		@include common-footer;
		.s-avatar {
			width: 100%;
			height: 100%;
		}
		nav {
			.s-btn.s-btn--fab.size-default {
				padding: {
					left: 4px;
					right: 4px;
				}
				width: auto;
			}
			.s-btn.icon,
			.s-btn.s-btn--fab {
				border-radius: 6px;
			}
		}
	}
</style>
