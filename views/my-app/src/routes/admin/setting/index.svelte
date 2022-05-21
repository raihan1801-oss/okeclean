<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../dashboard/_appbar.svelte';
	import DrawerContent from '../dashboard/_drawer.svelte';
	import FooterContent from '../dashboard/_footer.svelte';

	import { goto } from '$app/navigation';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';
	import type { Service } from '$lib/service-register';

	const title = 'Setting';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const service = getContext<Service>('service');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let user_login = $user;
	let progress: Progress;

	let notification_enable = false;
	let push_enable = false;
	let subscribed = false;
	let service_enable = false;
	let cache_size = '';

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;

			if (!user_login) {
				return goto('/admin', { replaceState: true });
			}

			account = {
				image: user_login.image ?? '',
				name: user_login.username,
				role: user_login.role
			};

			const notification_permission = await navigator.permissions.query({ name: 'notifications' });
			if (notification_permission.state == 'granted') {
				notification_enable = true;
			}
			notification_permission.addEventListener('change', () => {
				if (notification_permission.state == 'granted') {
					notification_enable = true;
				} else {
					notification_enable = false;
				}
			});

			const push_permission = await navigator.permissions.query({
				name: 'push',
				userVisibleOnly: true
			});
			if (push_permission.state == 'granted') {
				push_enable = true;
			}
			push_permission.addEventListener('change', () => {
				if (push_permission.state == 'granted') {
					push_enable = true;
				} else {
					push_enable = false;
				}
			});

			cache_calc();
			service.subscribed().then((value) => (subscribed = value));
			service_enable = service.registered();
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}
	async function cache_calc() {
		const storage = await navigator.storage.estimate();
		cache_size = `${((storage.usage ?? 0) / 1_000_000).toFixed()}mb/${(
			(storage.quota ?? 0) / 1_000_000_000
		).toFixed()}gb`;
	}
	async function cache_clear() {
		const keys = await caches.keys();
		for (const key of keys) {
			await caches.delete(key);
		}
		await cache_calc();
	}
	async function subscribe() {
		try {
			progress.showing();
			if (!user_login) throw new Error('User not found');
			if (subscribed) {
				await service.unsubscribe({
					nodeId: user_login.chatNodeId
				});
			} else {
				await service.subscribe({
					role: 'internal',
					userId: user_login.id,
					nodeId: user_login.chatNodeId
				});
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function service_change() {
		try {
			progress.showing();
			if (service_enable) {
				await service.unregister();
			} else {
				await service.register('/service-worker.js');
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="bg-neutral text-neutral-content">
	<section transition:fade class="flex">
		<Drawer min_width={false} show={drawerOpened} class="bg-base-100 w-[300px]">
			<DrawerContent />
		</Drawer>
		<Content class="flex-grow">
			<Appbar class="bg-base-100">
				<AppbarContent bind:account bind:mode bind:drawerOpened />
			</Appbar>
			<Progress bind:this={progress} />
			<Main>
				<section>
					<div class="text-2xl font-bold">{title}</div>
				</section>
				<form class="grid bg-base-100 p-6 rounded-lg">
					<div class="grid gap-12 w-[320px] justify-self-center">
						<div class="grid gap-4">
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Notification</span>
									<input
										on:change={() => {
											if (!notification_enable) window.Notification.requestPermission();
										}}
										checked={notification_enable}
										type="checkbox"
										class="toggle toggle-primary"
									/>
								</label>
							</div>
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Push</span>
									<input checked={push_enable} type="checkbox" class="toggle toggle-primary" />
								</label>
							</div>
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Subscribe</span>
									<input
										on:change={subscribe}
										checked={subscribed}
										type="checkbox"
										class="toggle toggle-primary"
									/>
								</label>
							</div>
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Installed</span>
									<input type="checkbox" class="toggle toggle-primary" />
								</label>
							</div>
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Service</span>
									<input
										on:change={service_change}
										checked={service_enable}
										type="checkbox"
										class="toggle toggle-primary"
									/>
								</label>
							</div>
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Cache ({cache_size})</span>
									<button on:click={cache_clear} class="btn btn-sm">Clear</button>
								</label>
							</div>
						</div>
					</div>
				</form>
			</Main>
			<div class="flex-grow" />
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
</style>
