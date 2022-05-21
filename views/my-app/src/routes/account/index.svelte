<script context="module" lang="ts">
	import {
		MaterialAppMin,
		Button,
		Icon,
		Avatar,
		List,
		ListGroup,
		ListItem,
		Card,
		Divider,
	} from 'svelte-materialify/src';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';
	import DeleteAccountDialog from '$components/delete-account-dialog.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import RegisterSeller from './_register-seller.svelte';
	import LoginSeller from './_login-seller.svelte';
	import ProgressLinear from '$components/progress-linear.svelte';
	import Appbar from '../_appbar.svelte';
	import {
		mdiAccountOutline,
		mdiClipboardListOutline,
		mdiBellOutline,
		mdiTagOutline,
		mdiLogout,
		mdiDeleteOutline,
		mdiCogOutline,
		mdiChevronRight,
		mdiAccountCircleOutline,
	} from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';
	import { APIS_URL, FETCH_MODE } from '$lib/env';
	import { SellerClientApi } from '$lib/seller';

	import type { ObserverUnsafe } from '$lib/helper';
	import type { BuyerClient, Service } from '../__layout.svelte';
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	const service = getContext<Service>('service');
	// const profile = writable(buyer.get());
	let user_login: BuyerClient.User;
	let address: BuyerClient.Address | null;
	let progress: ProgressLinear;
	let snackbar: Snackbar;
	const menu = [
		{
			name: 'Akun Saya',
			icon: mdiAccountOutline,
			sub: [
				{
					name: 'Profile',
					async action() {
						await navigate('/account/profile');
					},
				},
				// {
				// 	name: 'Alamat',
				// 	async action() {
				// 		await navigate('/account/address');
				// 	},
				// },
				{
					name: 'Ubah Password',
					async action() {
						await navigate('/account/change-password');
					},
				},
			],
			action() {},
		},
		// {
		// 	name: 'Pesanan Saya',
		// 	icon: mdiClipboardListOutline,
		// 	sub: [],
		// 	async action() {
		// 		await navigate('/order');
		// 	},
		// },
		// {
		// 	name: 'Jualan Saya',
		// 	icon: mdiTagOutline,
		// 	sub: [
		// 		{
		// 			name: 'Mulai Jual',
		// 			async action() {
		// 				const api = new SellerClientApi({
		// 					base: APIS_URL,
		// 					wsbase: '',
		// 					debug: dev,
		// 					mode: FETCH_MODE,
		// 					role: 'seller',
		// 					version: 'v0-alpha.1',
		// 				});
		// 				try {
		// 					progress.loading();
		// 					const token = await api.init().seller.token.retrieve();
		// 					let user: BuyerClient.Seller | null;
		// 					if (token) {
		// 						try {
		// 							user = await api.seller.auth();
		// 							return goto('/store');
		// 						} catch (error: any) {
		// 							if (
		// 								error.type == api.seller.api.Error.FailedAuthentication.type
		// 							) {
		// 								await api.seller.token.remove();
		// 							} else {
		// 								throw error;
		// 							}
		// 						}
		// 					}
		// 					user = await api.seller.search({
		// 						where: { username: $profile.username },
		// 					});
		// 					if (user) {
		// 						loginSeller.$set({
		// 							active: true,
		// 							data: { username: user.username },
		// 						});
		// 						loginSeller.$on('submit', async (event) => {
		// 							try {
		// 								progress.loading();
		// 								loginSeller.resetMessage();
		// 								await api.seller.login({
		// 									username: event.detail.username,
		// 									password: event.detail.password,
		// 								});
		// 								loginSeller.$set({
		// 									message: {
		// 										show: true,
		// 										state: 'success',
		// 										text: 'Berhasil Masuk',
		// 									},
		// 								});
		// 								setTimeout(() => {
		// 									navigate('/store');
		// 								}, 1000);
		// 							} catch (error: any) {
		// 								loginSeller.$set({
		// 									message: {
		// 										show: true,
		// 										state: 'error',
		// 										text: error.message,
		// 									},
		// 								});
		// 							} finally {
		// 								progress.loaded();
		// 							}
		// 						});
		// 					} else {
		// 						registerSeller.$set({
		// 							active: true,
		// 							data: {
		// 								email: $profile.email,
		// 								username: $profile.username,
		// 							},
		// 						});
		// 						registerSeller.$on('submit', async (event) => {
		// 							try {
		// 								progress.loading();
		// 								await api.seller.register({
		// 									email: event.detail.email,
		// 									username: event.detail.username,
		// 									password: event.detail.password,
		// 								});
		// 								registerSeller.$set({
		// 									message: {
		// 										show: true,
		// 										state: 'success',
		// 										text: 'Berhasil Mendaftar',
		// 									},
		// 								});
		// 								setTimeout(() => {
		// 									navigate('/store');
		// 								}, 1000);
		// 							} catch (error: any) {
		// 								registerSeller.$set({
		// 									message: {
		// 										show: true,
		// 										state: 'error',
		// 										text: error.message,
		// 									},
		// 								});
		// 							} finally {
		// 								progress.loaded();
		// 							}
		// 						});
		// 					}
		// 				} catch (error: any) {
		// 					snackbar.setText(error.message);
		// 					snackbar.show();
		// 				} finally {
		// 					progress.loaded();
		// 				}
		// 			},
		// 		},
		// 	],
		// 	action() {},
		// },
		{
			name: 'Pengaturan',
			icon: mdiCogOutline,
			sub: [],
			action() {
				goto('/account/setting');
			},
		},
		{
			name: 'Keluar',
			icon: mdiLogout,
			sub: [],
			async action() {
				progress.loading();
				// service.unsubscribe({ nodeId: $profile.chatNodeId });
				// await service.unregister();
				// await buyer.logout();
				buyer.api.user.logout();
				await goto('/', { replaceState: true });
			},
		},
		// {
		// 	name: 'Hapus Akun',
		// 	icon: mdiDeleteOutline,
		// 	sub: [],
		// 	action() {
		// 		showDeleteAccountDialog = true;
		// 	},
		// },
	];
	let imageUrl = '';
	let showDeleteAccountDialog = false;
	let showUserUnauthDialog = false;
	let registerSeller: RegisterSeller;
	let loginSeller: LoginSeller;

	$: loading = progress?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await buyer.ready;
			user_login = await buyer.api.user.auth();
			imageUrl = user_login.image ?? '';
			// address = await buyer.api.address.search({
			// 	where: {
			// 		selected: true,
			// 	},
			// });
		} catch (error: any) {
			console.error(error);
			switch (error.type) {
				case buyer.Error.FailedAuthentication.type:
					showUserUnauthDialog = true;
					break;

				default:
					break;
			}
		} finally {
			progress.loaded();
		}
	}
	async function release() {}
	function navigate(
		href: string,
		opts?:
			| {
					replaceState?: boolean | undefined;
					noscroll?: boolean | undefined;
					keepfocus?: boolean | undefined;
					state?: any;
			  }
			| undefined
	) {
		progress.loading();
		return goto(href, opts);
	}
	async function unregister() {
		progress.loading();
		// await buyer.logout();
		goto('/');
	}
</script>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 16px 0;
		display: grid;
		align-content: start;
		row-gap: 16px;
		@include main;
	}
	.profile {
		padding: 16px;
		display: grid;
		grid-template-columns: 1fr 4fr;
		grid-template-rows: 1fr;
		column-gap: 8px;
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
			align-content: space-around;
		}
	}
	.thumb {
		object-fit: cover;
		object-position: center;
		aspect-ratio: 1;
		border-radius: 50%;
	}
	.t-1 {
		font-size: 20px;
		font-weight: 500;
		line-height: normal;
		width: stretch;
	}
	.t-2 {
		font-size: 18px;
		font-weight: 500;
		line-height: normal;
		width: stretch;
	}
	.t-3 {
		font-size: 14px;
		font-weight: 500;
		line-height: normal;
		width: stretch;
		opacity: 0.7;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-footer;
		.thumb {
			width: 100%;
			height: 100%;
		}
		.s-list-item__title {
			line-height: normal;
		}
	}
</style>

<svelte:head>
	<title>Akun</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:this="{progress}"
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<Appbar
			loading="{$loading}"
			desktop="{$is_desktop}"
			title="{$is_desktop ? '' : 'Akun'}"
			back_nav
		/>
		<main class="main">
			{#if user_login}
				<Card>
					<div class="profile">
						{#if imageUrl}
							<img class="thumb" src="{imageUrl}" alt="" />
						{:else}
							<Avatar class="thumb">
								<Icon path="{mdiAccountCircleOutline}" />
							</Avatar>
						{/if}
						<div class="text">
							<div class="t-2">{user_login.name ?? '-'}</div>
							<div class="t-3">{address?.place || '-'}</div>
							<div class="t-3">{user_login.telp ?? '-'}</div>
						</div>
					</div>
				</Card>
			{:else}
				<Card>
					<div class="profile">
						<div class="thumb loading">&nbsp;</div>
						<div class="text">
							<div class="t-2 loading">&nbsp;</div>
							<div class="t-3 loading">&nbsp;</div>
							<div class="t-3 loading">&nbsp;</div>
						</div>
					</div>
				</Card>
			{/if}
			<section class="menu">
				<List>
					{#each menu as item, index}
						{#if index}
							<Divider />
						{/if}
						{#if item.sub.length}
							<ListGroup
								active="{false}"
								offset="{72}"
								on:click="{item.action}"
							>
								<span slot="prepend">
									<Icon path="{item.icon}" />
								</span>
								<span slot="activator">{item.name}</span>
								{#each item.sub as sub}
									<ListItem on:click="{sub.action}">{sub.name}</ListItem>
								{/each}
								<span slot="append">
									<Icon path="{mdiChevronRight}" />
								</span>
							</ListGroup>
						{:else}
							<ListItem
								active="{false}"
								activeClass=""
								on:click="{item.action}"
							>
								<span slot="prepend">
									<Icon path="{item.icon}" />
								</span>
								<span>{item.name}</span>
							</ListItem>
						{/if}
					{/each}
				</List>
			</section>
		</main>
		<Snackbar bind:this="{snackbar}" />
		<RegisterSeller bind:this="{registerSeller}" />
		<LoginSeller bind:this="{loginSeller}" />
		<DeleteAccountDialog
			bind:active="{showDeleteAccountDialog}"
			on:granted="{unregister}"
		/>
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" role="customer" />
	</MaterialAppMin>
</div>
