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

	import type { ClientApi, Service, User } from '../__layout.svelte';

	const title = 'Broadcast';
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

	let subscribers_options = ['buyer', 'seller', 'courier', 'internal'];
	let subscribers_data: ClientApi.Admin.Subs[] = [];
	let tag = '';
	let subscriber = '';
	let href = '';
	let notifications = {
		tag: '',
		title: '',
		image: '',
		body: '',
		badge: "logo.png",
		icon: "logo.png",
		renotify: true
	};
	let state = '';
	let message = '';
	let allow = false;
	let disable = true;

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

			subscribers_data = await client.admin.subscribers();

			allow = true;
			disable = false;
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
	async function push() {
		try {
			progress.showing();
			disable = true;
			const result = await service.broadcast({
				tag,
				subscribers: [subscriber],
				href,
				notifications
			});
			state = result.state;
			message = result.message;
			subscribers_data = await client.admin.subscribers();
		} catch (error: any) {
			message = error.message;
		} finally {
			disable = false;
			progress.hiding();
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="text-gray-900 bg-gray-50 dark:text-gray-50 dark:bg-gray-900">
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
				<form
					on:submit|preventDefault={push}
					class="flex flex-col gap-12 p-6 bg-base-100 rounded-lg"
				>
					<div class="flex flex-col gap-4 justify-self-center">
						{#if state == 'success'}
							<output class="alert alert-success">
								<div class="grid grid-flow-col gap-2">
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/></svg
									>
									<div class="text-justify">{message}</div>
								</div>
							</output>
						{:else if state == 'warn'}
							<output class="alert alert-warning">
								<div class="grid grid-flow-col gap-2">
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/></svg
									>
									<div class="text-justify">{message}</div>
								</div>
							</output>
						{:else if state == 'failed'}
							<output class="alert alert-error">
								<div class="grid grid-flow-col gap-2">
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/></svg
									>
									<div class="text-justify">{message}</div>
								</div>
							</output>
						{/if}
						{#if allow}
							<div class="form-control">
								<label for="tag" class="label">
									<span class="label-text">Tag</span>
								</label>
								<input
									bind:value={tag}
									id="tag"
									required
									class="input input-ghost input-primary bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="href" class="label">
									<span class="label-text">Hyperlink</span>
								</label>
								<input
									bind:value={href}
									id="href"
									required
									class="input input-ghost input-primary bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="subscribers" class="label">
									<span class="label-text">Subscribers</span>
								</label>
								<select
									bind:value={subscriber}
									id="subscribers"
									required
									class="select select-ghost select-primary bg-base-200"
								>
									<option value="*">All</option>
									<optgroup label="By Role">
										{#each subscribers_options as options}
											<option value={options}>@{options}</option>
										{/each}
									</optgroup>
									<optgroup label="By ID">
										{#each subscribers_data as options}
											<option value={options.id}>#{options.id}</option>
										{/each}
									</optgroup>
								</select>
							</div>
							<div class="form-control">
								<label for="n-tag" class="label">
									<span class="label-text">Notifications Tag</span>
								</label>
								<input
									bind:value={notifications.tag}
									id="n-tag"
									required
									class="input input-ghost input-primary bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="n-title" class="label">
									<span class="label-text">Notifications Title</span>
								</label>
								<input
									bind:value={notifications.title}
									id="n-title"
									required
									class="input input-ghost input-primary bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="image" class="label">
									<span class="label-text">Notifications Image</span>
								</label>
								<input
									bind:value={notifications.image}
									id="image"
									class="input input-ghost input-primary bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="n-body" class="label">
									<span class="label-text">Notifications Body</span>
								</label>
								<textarea
									bind:value={notifications.body}
									id="n-body"
									required
									class="textarea textarea-ghost textarea-primary bg-base-200"
								/>
							</div>
						{:else}
							<div class="flex items-center gap-4 px-6 py-3 rounded-md">
								<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
									&nbsp;
								</div>
							</div>
							<div class="flex items-center gap-4 px-6 py-3 rounded-md">
								<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
									&nbsp;
								</div>
							</div>
							<div class="flex items-center gap-4 px-6 py-3 rounded-md">
								<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
									&nbsp;
								</div>
							</div>
						{/if}
					</div>
					<button disabled={disable} class="btn btn-primary">Push</button>
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
