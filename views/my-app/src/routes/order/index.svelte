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
	} from '@mdi/js';
	import { mdiClipboardTextClockOutline } from '$lib/icons';
	import ProgressLinear from '$components/progress-linear.svelte';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';

	import type { BuyerClient } from '../__layout.svelte';

	const title = 'Pesanan Saya';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	let orderMenu = [
		{
			name: 'Menunggu',
			icon: mdiClipboardTextOutline,
			link: '/order/waiting',
			count: 0,
		},
		{
			name: 'Di Proses',
			icon: mdiSync,
			link: '/order/process',
			count: 0,
		},
		{
			name: 'Di Kirim',
			icon: mdiTruckDeliveryOutline,
			link: '/order/delivery',
			count: 0,
		},
		{
			name: 'Konfirmasi',
			icon: mdiClipboardTextClockOutline,
			link: '/order/confirm',
			count: 0,
		},
	];
	let otherMenu = [
		{
			name: 'Semua',
			icon: mdiClipboardTextMultipleOutline,
			link: '/order/all',
			count: 0,
		},
		{
			name: 'Penilaian',
			icon: mdiStarOutline,
			link: '/order/rating/list',
			count: 0,
		},
	];
	let user: BuyerClient.Buyer;
	let orders: BuyerClient.Order[] = [];
	let loader: ProgressLinear;
	let address: BuyerClient.Address;
	let imageUrl = '';
	let showUserUnauthDialog = false;

	$: isLoading = loader?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;

			user = await client.auth();

			imageUrl = user.image ?? '';

			orders = await client.api.order.searchMany({
				where: {
					AND: [
						{ buyerId: user.id },
						{ status: { notIn: ['Done', 'Reject'] } },
					],
				},
			});

			type Menu = {
				name: string;
				icon: string;
				link: string;
				count: number;
			};

			const queue = orderMenu.find((menu) =>
				menu.link.endsWith('waiting')
			) as Menu;
			const process = orderMenu.find((menu) =>
				menu.link.endsWith('process')
			) as Menu;
			const delivery = orderMenu.find((menu) =>
				menu.link.endsWith('delivery')
			) as Menu;
			const confirm = orderMenu.find((menu) =>
				menu.link.endsWith('confirm')
			) as Menu;

			for (const order of orders) {
				if (order.status == 'Queue') {
					queue.count++;
				} else if (order.status == 'Process') {
					process.count++;
				} else if (order.status == 'Delivery') {
					delivery.count++;
				} else if (order.status == 'Confirm') {
					confirm.count++;
				}
			}

			orderMenu = [queue, process, delivery, confirm];

			address = await client.api.address.search({
				where: { AND: [{ buyerId: user.id }, { selected: true }] },
				rejectOnNotFound: true,
			});
		} catch (error: any) {
		} finally {
			loader.loaded();
		}
	}
	async function release() {}
</script>

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
		<main class="main">
			{#if user}
				<section class="card">
					<div class="profile">
						{#if imageUrl}
							<img
								class="thumb"
								src="{imageUrl}"
								alt=""
								on:error="{() => (imageUrl = '')}" />
						{:else}
							<Avatar class="thumb">
								<Icon
									class="grey-text text-darken-2"
									path="{mdiAccountCircleOutline}" />
							</Avatar>
						{/if}
						<div class="text">
							{#if user}
								<div class="t-2">{user.name ?? '-'}</div>
							{:else}
								<div class="t-2">-</div>
							{/if}
							{#if address}
								<div class="t-3">{address.telp}</div>
								<div class="t-3">{address.place}</div>
							{:else}
								<div class="t-3">-</div>
								<div class="t-3">-</div>
							{/if}
						</div>
					</div>
				</section>
				<section class="section">
					<div class="t-3">Pesanan berlangsung</div>
					<nav class="card">
						<ul class="column">
							{#each orderMenu as item}
								<li class="item">
									<Badge
										class="primary-color"
										bordered
										value="{item.count + ''}"
										active="{item.count > 0}"
										offsetX="{16}"
										offsetY="{16}">
										<Button text fab size="default">
											<a class="link grey-text text-darken-3" href="{item.link}"
												><Icon path="{item.icon}" />
												<div>{item.name}</div>
											</a>
										</Button>
									</Badge>
								</li>
							{/each}
						</ul>
					</nav>
				</section>
				<section class="section">
					<div class="t-3">Lainnya</div>
					<nav class="card">
						<ul class="column">
							{#each otherMenu as item}
								<li class="item">
									<Badge
										class="primary-color"
										bordered
										value="{item.count + ''}"
										active="{item.count > 0}"
										offsetX="{16}"
										offsetY="{16}">
										<Button text fab size="default">
											<a class="link grey-text text-darken-3" href="{item.link}"
												><Icon path="{item.icon}" />
												<div>{item.name}</div>
											</a>
										</Button>
									</Badge>
								</li>
							{/each}
						</ul>
					</nav>
				</section>
			{:else}
				<section class="card">
					<div class="profile">
						<div class="thumb loading">&nbsp;</div>
						<div class="text">
							<div class="t-2 loading">&nbsp;</div>
							<div class="t-3 loading">&nbsp;</div>
							<div class="t-3 loading">&nbsp;</div>
						</div>
					</div>
				</section>
				<section class="section">
					<div class="t-3 loading">&nbsp;</div>
					<section class="card column">
						{#each orderMenu as item}
							<div class="item loading">&nbsp;</div>
						{/each}
					</section>
				</section>
				<section class="section">
					<div class="t-3 loading">&nbsp;</div>
					<section class="card column">
						{#each orderMenu as item}
							<div class="item loading">&nbsp;</div>
						{/each}
					</section>
				</section>
			{/if}
		</main>
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
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
	.profile {
		padding: 16px 12px;
		display: grid;
		grid-template-columns: 1fr 4.5fr;
		grid-template-rows: 1fr;
		column-gap: 16px;
		@include medium-only {
			grid-template-columns: 1fr 5fr;
		}
		@include large-only {
			grid-template-columns: 1fr 7fr;
		}
		@include very-large-up {
			grid-template-columns: 1fr 11fr;
		}
		.text {
			display: grid;
			align-content: space-between;
		}
	}
	.card {
		@include elevation;
		border-radius: 6px;
	}
	.column {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		padding: 8px 4px;
	}
	.item {
		display: grid;
		place-items: center;
		min-width: 48px;
		min-height: 48px;
	}
	.link {
		display: grid;
		justify-items: center;
		row-gap: 4px;
		text-transform: capitalize;
		font-size: 11px;
	}
	.thumb,
	:global(.thumb) {
		object-fit: cover;
		object-position: center;
		width: 100%;
		border-radius: 50%;
		aspect-ratio: 1;
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
		row-gap: 8px;
	}
	ul {
		list-style: none;
		padding-left: 0;
	}
	a {
		text-decoration: none;
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
			// .s-badge {}
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
