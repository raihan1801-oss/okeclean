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
	import Avatar from '$components/avatar.svelte';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Total Users';
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
	let users: ClientApi.User[] = [];

	onMount(init);

	async function init() {
		try {
			await client.ready;
			users = await client.user.get_all();
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

<Page {mode} class="bg-neutral text-neutral-content">
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
					{#each users as user}
						<ListItem>
							<a
								href="user/{user.role}-{user.id}"
								class="flex items-center gap-4 p-2 bg-base-100 rounded-md hover:bg-primary active:bg-secondary transition"
							>
								<Avatar
									account={{ image: user.image, title: user.name, subtitle: user.role }}
									class="flex-[20%]"
								/>
								<div class="flex flex-[20%] flex-col justify-evenly">
									<div class="text-sm">{user.email}</div>
									<div class="text-sm">{user.telp ?? '---'}</div>
								</div>
								<div class="flex-[40%]">
									<div class="trunc">{user.address?.name ?? '---'}</div>
								</div>
							</a>
						</ListItem>
					{/each}
					{#each fake as value}
						<ListItem>
							<a href="?" class="flex items-center gap-4 p-2 bg-base-100 rounded-md">
								<Avatar class="w-full" />
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
