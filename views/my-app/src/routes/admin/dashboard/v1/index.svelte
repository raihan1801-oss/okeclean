<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	import { Currency } from '$lib/helper';

	import SideBar from '../../_side-bar.svelte';
	import AppBar from '../../_app-bar.svelte';
	import Main from '../../_main.svelte';
	import Footer from '../../_footer.svelte';
	import Progress from '$components/progress.svelte';

	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Dashboard';
	const desc = 'Dashboard';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode: 'light' | 'dark' = 'dark';
	let opened = true;
	let profile = { image: '', name: '', role: '' };
	let loader: Progress;
	let fake = Array(4);
	let stat: ClientApi.Admin.Stat;

	onMount(async () => {
		try {
			if (!user.get()) {
				return goto(base + '/');
			}
			await client.ready;
			stat = await client.admin.stat();
			fake = Array(0);
			profile = {
				image: $user?.image as any,
				name: $user?.username as any,
				role: $user?.role as any
			};
			const event = client.admin.event;
			event.addEventListener('message', async (event) => {
				stat = await client.admin.stat();
			});
			await event.open;
		} catch (error: any) {
			console.error(error);
		} finally {
			loader.hiding();
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<section
	transition:slide
	data-theme={mode}
	class="{mode} grid grid-flow-col grid-cols-[2.5fr,9.5fr] bg-base-100"
>
	<SideBar show={opened} />
	<section class="flex flex-col">
		<AppBar bind:mode bind:opened account={profile} />
		<Progress bind:this={loader} />
		<Main>
			<section>
				<div class="text-3xl text-base-content font-bold">{title}</div>
			</section>
			<section class="grid grid-cols-[1fr,1fr,1fr,1fr] gap-4">
				{#if stat}
					<a
						class="grid gap-2 p-4 bg-base-200 text-base-content rounded-lg hover:ring hover:ring-primary"
						href="/admin/dashboard/user"
					>
						<div class="flex gap-2">
							<div class="grid gap-1 flex-auto">
								<div class="text-xs opacity-70">Total Pengguna</div>
								<div class="text-xl">{stat.user}</div>
							</div>
							<div>
								<div class="p-2 rounded-2xl bg-base-300">
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
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/></svg
									>
								</div>
							</div>
						</div>
						<!-- <div class="">8.5 up from yerterday</div> -->
					</a>
					<section class="grid gap-2 p-4 bg-base-200 text-base-content rounded-lg">
						<div class="flex gap-2">
							<div class="grid gap-1 flex-auto">
								<div class="text-xs opacity-70">Total Pesanan</div>
								<div class="text-xl">{stat.order}</div>
							</div>
							<div>
								<div class="p-2 rounded-2xl bg-base-300">
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
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/></svg
									>
								</div>
							</div>
						</div>
						<!-- <div class="">8.5 up from yerterday</div> -->
					</section>
					<section class="grid gap-2 p-4 bg-base-200 text-base-content rounded-lg">
						<div class="flex gap-2">
							<div class="grid gap-1 flex-auto">
								<div class="text-xs opacity-70">Total Product</div>
								<div class="text-xl">{stat.product}</div>
							</div>
							<div>
								<div class="p-2 rounded-2xl bg-base-300">
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
											d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
										/></svg
									>
								</div>
							</div>
						</div>
						<!-- <div class="">8.5 up from yerterday</div> -->
					</section>
					<section class="grid gap-2 p-4 bg-base-200 text-base-content rounded-lg">
						<div class="flex gap-2">
							<div class="grid gap-1 flex-auto">
								<div class="text-xs opacity-70">Total Penjualan</div>
								<div class="text-xl">Rp. {Currency.toMoney(stat.sales)}</div>
							</div>
							<div>
								<div class="p-2 rounded-2xl bg-base-300">
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
											d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
										/></svg
									>
								</div>
							</div>
						</div>
						<!-- <div class="">8.5 up from yerterday</div> -->
					</section>
				{/if}
				{#each fake as value}
					<section class="grid gap-2 p-4 bg-gray-700 rounded-lg">
						<div class="flex gap-2">
							<div class="grid gap-1 flex-auto">
								<div class="text-transparent bg-base-300 rounded animate-pulse">&nbsp;</div>
								<div class="text-transparent bg-base-300 rounded animate-pulse">&nbsp;</div>
							</div>
							<div>
								<div class="p-2 rounded-2xl text-transparent bg-base-300 animate-pulse">
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
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/></svg
									>
								</div>
							</div>
						</div>
						<div class="text-transparent bg-base-300 rounded animate-pulse">&nbsp;</div>
					</section>
				{/each}
			</section>
		</Main>
		<dir class="flex-grow" />
		<Footer />
	</section>
</section>

<style lang="scss"></style>
