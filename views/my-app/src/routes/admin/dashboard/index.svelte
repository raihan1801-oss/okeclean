<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Dashboard';
	const desc = 'Dashboard';
</script>

<script lang="ts">
	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from './_appbar.svelte';
	import DrawerContent from './_drawer.svelte';
	import FooterContent from './_footer.svelte';
	import Stat from './_stat.svelte';

	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	// const client = getContext<ClientApi>('clientApi');
	// const user = getContext<User>('user');
	// const service = getContext<Service>('service');
	// const event = client.admin.event;

	let mode = 'dark';
	let drawerOpened = true;
	let user_login = $user as ClientApi.User;
	let account = { image: '', name: '', role: '' };
	let progress: Progress;
	let stat: ClientApi.Admin.Stat;

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;
			stat = await client.admin.stat();
			account = {
				image: user_login.image ?? '',
				name: user_login.name,
				role: user_login.role
			};

			// await event.open();

			// event.addEventListener('message', async (event) => {
			// 	stat = await client.admin.stat();
			// });

			// service.register('/service-worker.js');
			// service.subscribe({ role: 'internal', userId: user_login.id, nodeId: user_login.chatNodeId });
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
			// event.close();
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="bg-neutral text-neutral-content">
	<section transition:fade class="flex">
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
				<section class="grid grid-cols-4 gap-4">
					<Stat stat={stat} />
				</section>
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
