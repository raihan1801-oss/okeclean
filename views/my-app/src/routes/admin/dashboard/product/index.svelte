<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade } from 'svelte/transition';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer from '$components/drawer.svelte';
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

	import { Currency } from '$lib/helper';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Total Products';
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
	let products: ClientApi.Admin.Product[] = [];

	onMount(init);

	async function init() {
		try {
			await client.ready;
			products = await client.admin.products();
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
	function toMoney(value: any) {
		return 'Rp. ' + Currency.toMoney(value);
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="text-gray-900 bg-gray-50 dark:text-gray-50 dark:bg-gray-900">
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
				<List class="gap-2">
					{#each products as product}
						<ListItem>
							<a
								href="product/{product.id}"
								class="flex items-center gap-4 p-2 bg-base-100 rounded-md hover:bg-primary active:bg-secondary transition"
							>
								<Avatar
									account={{
										image: product.image,
										title: product.name,
										subtitle: product.store.name
									}}
									class="flex-[25%]"
								/>
								<div class="flex flex-[10%] flex-col justify-between">
									<div class="text-sm">{toMoney(product.price)}</div>
									<div class="text-sm">{product.stock} available</div>
								</div>
								<div class="flex-[40%]">
									<div class="trunc-2">{product.store.address ?? '---'}</div>
								</div>
								<div class="flex flex-[5%]">
									<div class="badge badge-md {product.forSale ? 'bg-success' : 'bg-error'}">
										sale
									</div>
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
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
	}
	.trunc-1 {
		@extend .trunc;
		-webkit-line-clamp: 1;
	}
	.trunc-2 {
		@extend .trunc;
		-webkit-line-clamp: 2;
	}
</style>
