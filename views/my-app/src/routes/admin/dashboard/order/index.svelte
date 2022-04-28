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

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Total Orders';
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
	let orders: ClientApi.Transaction[] = [];

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;
			orders = await client.transaction.get_all();
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
					{#each orders as order}
						<ListItem>
							<a
								href="order/{order.id}"
								class="flex items-center gap-4 py-2 px-3 bg-base-100 rounded-md hover:bg-primary active:bg-secondary transition"
							>
								<!-- <div class="stack stack-x flex-[7.5%] justify-start">
									{#each order.item as item}
										<img
											src={item.product.image}
											alt={item.product.name}
											class="w-11 h-11 aspect-1 object-cover object-center rounded-md"
										/>
									{/each}
								</div> -->
								<!-- <div class="flex">
									<div class="text-sm trunc-2">
										{order.data.services.join("")}
									</div>
								</div> -->
								<!-- <div class="flex flex-[20%] flex-col justify-between">
									<div class="text-sm">{order.delivery.recipient.name}</div>
									<div class="text-sm trunc-1">
										{order.delivery.recipient.place}, {order.delivery.recipient.local}
									</div>
								</div>
								<div class="flex flex-[20%] flex-col justify-between">
									<div class="text-sm">{order.delivery.sender.name}</div>
									<div class="text-sm trunc-1">
										{order.delivery.sender.place}, {order.delivery.sender.local}
									</div>
								</div> -->
								<div class="flex">
									{#if order.status == 'create'}
										<div class="badge badge-md badge-warning p-3">{order.status}</div>
									{:else if order.status == 'proccess'}
										<div class="badge badge-md badge-info p-3">{order.status}</div>
									{:else if order.status == 'finish'}
										<div class="badge badge-md badge-success p-3">{order.status}</div>
									{:else if order.status == 'cancel'}
										<div class="badge badge-md badge-error p-3">{order.status}</div>
									{/if}
								</div>
								<div class="flex flex-col justify-between">
									<div class="text-sm">{order.data.services.join('')}</div>
									<div class="text-sm">Rp. {Currency.toMoney(order.cost + '')}</div>
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
