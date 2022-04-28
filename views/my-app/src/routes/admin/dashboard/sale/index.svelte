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

	const title = 'Total Sales';
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
	let sales: ClientApi.Admin.Sale[] = [];

	onMount(init);

	async function init() {
		try {
			await client.ready;
			sales = await client.admin.sales();
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
					{#each sales as sale}
						<ListItem>
							<a
								href="sale/{sale.id}"
								class="flex items-center gap-4 p-2 bg-base-100 rounded-md hover:bg-primary active:bg-secondary transition"
							>
								<div class="stack stack-x flex-[5%] justify-start">
									{#each sale.item as item}
										<img
											src={item.product.image}
											alt={item.product.name}
											class="w-11 h-11 aspect-1 object-cover object-center rounded-md"
										/>
									{/each}
								</div>
								<div class="flex flex-[25%]">
									<div class="text-sm trunc-2">
										{sale.item.map((item) => item.product.name).join(', ')}
									</div>
								</div>
								<div class="flex flex-[20%] flex-col justify-between">
									<div class="text-sm">{sale.buyer.username ?? '---'}</div>
									<div class="text-sm">{sale.buyer.email ?? '---'}</div>
								</div>
								<div class="flex flex-[20%] flex-col justify-between">
									<div class="text-sm trunc-1">{new Date(sale.createOn).toLocaleString()}</div>
									<div class="text-sm trunc-1">
										{sale.finishOn ? new Date(sale.finishOn).toLocaleString() : '---'}
									</div>
								</div>
								<div class="flex flex-[10%] flex-col justify-between">
									<div class="text-sm">
										Rp. {Currency.toMoney(+sale.cost + +sale.delivery.cost)}
									</div>
								</div>
								<div class="flex gap-1 flex-[20%]">
									{#each Array(5).fill(true, 0, sale.rating?.star ?? 0) as star}
										<svg
											class="w-6 h-6 {star ? 'text-warning fill-current' : ''}"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
											/></svg
										>
									{/each}
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
	.aspect-1 {
		aspect-ratio: 1;
	}
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
