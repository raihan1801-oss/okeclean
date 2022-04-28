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

	import type { ClientApi, User } from '../__layout.svelte';

	const title = 'Server';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let user_login = $user;
	let progress: Progress;
	let scroll_container: HTMLElement;
	let log = '';

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;

			if (!user_login) {
				return goto('/admin', {replaceState: true});
			}

			account = {
				image: user_login.image ?? '',
				name: user_login.username,
				role: user_login.role
			};
			
			const event = await client.admin.api.es({ endpoint: 'log', persist: true }).open();
			event.message('initial', (data) => {
				log += data;
				scrollBottom();
			});
			event.message('continue', (data) => {
				log += data;
				scrollBottom();
			});
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
			await client.admin.api.es({ endpoint: 'log', persist: true }).close();
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}
	async function reset() {
		try {
			progress.showing();
			await client.admin.log_reset();
			log = '';
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function download() {
		try {
			progress.showing();
			const dir_handle = await (window as any).showDirectoryPicker();
			const new_file_handle = await dir_handle.getFileHandle('server.log', {
				create: true
			});
			const response = await client.admin.log_download();
			await response.body?.pipeTo(await new_file_handle.createWritable());
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	function scrollBottom() {
		setTimeout(() => {
			scroll_container.scrollTo({
				behavior: 'smooth',
				top: scroll_container.scrollHeight
			});
		}, 500);
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="text-gray-900 bg-gray-50 dark:text-gray-50 dark:bg-gray-900">
	<section transition:fade class="flex w-screen h-screen overflow-auto">
		<Drawer min_width={false} show={drawerOpened} class="bg-base-100 w-[300px]">
			<DrawerContent />
		</Drawer>
		<Content class="flex-grow w-full h-screen overflow-auto">
			<Appbar class="bg-base-100">
				<AppbarContent bind:account bind:mode bind:drawerOpened />
			</Appbar>
			<Progress bind:this={progress} />
			<Main bind:node={scroll_container} class="flex-grow w-full overflow-auto">
				<section>
					<div class="text-2xl font-bold">{title}</div>
				</section>
				<pre>
					{@html log}
				</pre>
				<div class="flex gap-4 p-4 bg-base-100 rounded-md">
					<button on:click={reset} class="btn btn-sm">Reset</button>
					<button on:click={download} class="btn btn-sm">Download</button>
				</div>
			</Main>
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
</style>
