<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../_appbar.svelte';
	import DrawerContent from '../_drawer.svelte';
	import FooterContent from '../_footer.svelte';
	import List from '$components/list.svelte';
	import ListItem from '$components/list-item.svelte';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Total Subscribers';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let progress: Progress;

	let fake = Array(6);
	let subscribers: ClientApi.Admin.Subs[] = [];

	onMount(init);

	async function init() {
		try {
			await client.ready;
			subscribers = await client.admin.subscribers();
			fake = Array(0);
		} catch (error: any) {
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
		} finally {
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="text-gray-900 bg-gray-50 dark:text-gray-50 dark:bg-gray-900">
	<section transition:slide class="flex">
		<Drawer show={drawerOpened} class="bg-base-100">
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
				<List class="gap-2">
					{#each subscribers as user}
						<ListItem>
							<a
								href="user/{user.role}-{user.userId}"
								class="flex items-center gap-4 p-2 bg-base-100 rounded-md hover:bg-primary active:bg-secondary transition"
							>
								<div class="flex flex-[20%] flex-col justify-evenly">
									<div class="text-sm">{user.role}</div>
									<div class="text-sm">#{user.id}</div>
								</div>
								<button
									on:click|preventDefault={async () => {
										await client.admin.unsubscrib(user.id);
										await init();
									}}
									class="btn btn-square btn-sm"
								>
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
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/></svg
									>
								</button>
							</a>
						</ListItem>
					{/each}
					{#each fake as value}
						<ListItem>
							<a href="?" class="flex items-center gap-4 p-2 bg-base-100 rounded-md">
								<div class="w-full h-6 bg-base-200 animate-pulse">&nbsp;</div>
								<div class="w-full h-6 bg-base-200 animate-pulse">&nbsp;</div>
								<div class="w-full h-6 bg-base-200 animate-pulse">&nbsp;</div>
							</a>
						</ListItem>
					{/each}
				</List>
			</Main>
			<div class="flex-grow" />
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
	.trunc {
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		display: -webkit-box;
		overflow: hidden;
	}
</style>
