<script context="module" lang="ts">
	import {
		MaterialAppMin,
		List,
		ListItem,
		Divider,
		Subheader,
		Switch,
		Button,
	} from 'svelte-materialify/src';
	import UserUnauthDialog from '$components/user-unauth-dialog.svelte';
	import Snackbar from '$components/snackbar.svelte';
	import ProgressLinear from '$components/progress-linear.svelte';
	import Appbar from '../_appbar.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';

	import type { ObserverUnsafe } from '$lib/helper';
	import type { BuyerClient, Service } from '../__layout.svelte';
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	const service = getContext<Service>('service');
	// const profile = writable(buyer.get());
	let user_login: BuyerClient.User;
	let progress: ProgressLinear;
	let snackbar: Snackbar;
	let location = false;
	let notification = false;
	let push_notification = false;
	let app_installed = false;
	let service_worker = false;
	let chat_service = false;
	let cache = '';
	let showUserUnauthDialog = false;

	$: loading = progress?.active;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await buyer.ready;
			user_login = await buyer.api.user.auth();
			// if (!$profile) {
			// 	$profile = await buyer.auth();
			// 	buyer.set($profile);
			// }
			ask_cache();
			ask_geolocation();
			ask_notification();
			ask_app_installed();
			ask_service_worker();
			ask_push();
			ask_periodic_sync();
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
	async function ask_geolocation() {
		const g_permission = await navigator.permissions.query({
			name: 'geolocation',
		});
		if (g_permission.state == 'granted') {
			location = true;
		}
		g_permission.addEventListener('change', (event) => {
			console.log(event);
			if (g_permission.state == 'granted') {
				location = true;
			} else {
				location = false;
			}
		});
	}
	async function ask_notification() {
		const n_permission = await navigator.permissions.query({
			name: 'notifications',
		});
		if (n_permission.state == 'granted') {
			notification = true;
		}
		n_permission.addEventListener('change', (event) => {
			console.log(event);
			if (n_permission.state == 'granted') {
				notification = true;
			} else {
				notification = false;
			}
		});
	}
	async function ask_push() {
		push_notification = await service.subscribed();
	}
	async function ask_periodic_sync() {
		await navigator.permissions.query({
			name: 'periodic-background-sync' as any,
		});
	}
	async function ask_service_worker() {
		service_worker = service.registered();
	}
	async function ask_cache() {
		const storage = await navigator.storage.estimate();
		cache = `${((storage.usage ?? 0) / 1_000_000).toFixed()}mb/${(
			(storage.quota ?? 0) / 1_000_000_000
		).toFixed()}gb`;
	}
	async function ask_app_installed() {
		app_installed = service.installed;
	}
	async function request_push() {
		try {
			progress.loading();
			// if (!$profile) throw new Error('User not found');
			// if (push_notification) {
			// 	console.log("unsubscribe");
			// 	await service.unsubscribe({
			// 		nodeId: $profile.chatNodeId,
			// 	});
			// } else {
			// 	console.log("subscribe");
			// 	await service.subscribe({
			// 		role: 'buyer',
			// 		userId: $profile.id,
			// 		nodeId: $profile.chatNodeId,
			// 	});
			// }
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.loaded();
		}
	}
	async function request_install() {
		try {
			progress.loading();
			if (app_installed) {
				app_installed = true;
			} else {
				await service.register('/service-worker.js');
				const result = await service.prompt();
				console.log(result);
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.loaded();
		}
	}
	async function request_register() {
		try {
			progress.loading();
			if (service_worker) {
				await service.unregister();
			} else {
				await service.register('/service-worker.js');
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.loaded();
		}
	}
	async function update() {
		try {
			progress.loading();
		} catch (error: any) {
		} finally {
			progress.loaded();
		}
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
	form {
		display: grid;
		row-gap: 16px;
	}
	.label {
		width: 50%;
		height: 18px;
	}
	.textfield {
		height: 48px;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-footer;
		.s-list-item__title,
		.s-list-item__subtitle {
			line-height: normal;
		}
	}
</style>

<svelte:head>
	<title>Pengaturan</title>
	<meta name="description" content="Pengaturan" />
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
			<form id="setting" on:submit|preventDefault="{update}">
				{#if user_login}
					<List>
						<Subheader>Locations</Subheader>
						<ListItem>
							<span>Locations</span>
							<span slot="subtitle"> Allow Locations </span>
							<span slot="append">
								<Switch
									checked="{location}"
									on:change="{() => {
										window.navigator.geolocation.getCurrentPosition(() => {});
									}}"
								/>
							</span>
						</ListItem>
						<Divider />
						<Subheader>Notifications</Subheader>
						<ListItem>
							<span>Notifications</span>
							<span slot="subtitle"> Allow Notifications </span>
							<span slot="append">
								<Switch
									checked="{notification}"
									on:change="{() => {
										window.Notification.requestPermission();
									}}"
								/>
							</span>
						</ListItem>
						<ListItem>
							<span>Web Push</span>
							<span slot="subtitle"> Allow Push Notification </span>
							<span slot="append">
								<Switch
									checked="{push_notification}"
									on:change="{request_push}"
								/>
							</span>
						</ListItem>
						<Divider />
						<Subheader>PWA</Subheader>
						<ListItem>
							<span>App Installed</span>
							<span slot="subtitle"> Install Web App </span>
							<span slot="append">
								<Switch
									checked="{app_installed}"
									on:change="{request_install}"
								/>
							</span>
						</ListItem>
						<ListItem>
							<span>Serivce</span>
							<span slot="subtitle"> Service Worker </span>
							<span slot="append">
								<Switch
									checked="{service_worker}"
									on:change="{request_register}"
								/>
							</span>
						</ListItem>
						<ListItem>
							<span>Cache</span>
							<span slot="subtitle"> Size {cache} </span>
							<span slot="append">
								<Button
									on:click="{async () => {
										const keys = await window.caches.keys();
										for (const key of keys) {
											await window.caches.delete(key);
										}
										await ask_cache();
									}}">Reset</Button
								>
							</span>
						</ListItem>
						<Divider />
						<Subheader>Authentication</Subheader>
						<ListItem multiline>
							<span>Two Factor Authentication</span>
							<span slot="subtitle"
								>Using 2 factor authentication for Login</span
							>
							<span slot="append">
								<Switch bind:checked="{user_login.multi_auth}" />
							</span>
						</ListItem>
					</List>
				{:else}
					<List>
						<Subheader><div class="label loading"></div></Subheader>
						<ListItem><div class="textfield loading"></div></ListItem>
						<ListItem><div class="textfield loading"></div></ListItem>
						<Subheader><div class="label loading"></div></Subheader>
						<ListItem><div class="textfield loading"></div></ListItem>
						<ListItem><div class="textfield loading"></div></ListItem>
						<Subheader><div class="label loading"></div></Subheader>
						<ListItem><div class="textfield loading"></div></ListItem>
						<ListItem><div class="textfield loading"></div></ListItem>
					</List>
				{/if}
			</form>
		</main>
		<Snackbar bind:this="{snackbar}" />
		<UserUnauthDialog bind:active="{showUserUnauthDialog}" />
	</MaterialAppMin>
</div>
