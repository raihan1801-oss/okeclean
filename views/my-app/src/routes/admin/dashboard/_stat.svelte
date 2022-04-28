<script context="module" lang="ts">
	import { base } from '$app/paths';
	import { Currency } from '$lib/helper';

	import type { ClientApi } from '$apis/index';
</script>

<script lang="ts">
	let fake = Array(4);
	export let stat: ClientApi.Admin.Stat | undefined = undefined;
</script>

{#if stat}
	<a
		class="w-full grid gap-2 p-4 bg-base-100 rounded-lg hover:ring hover:ring-primary"
		href="dashboard/user"
	>
		<div class="flex gap-2">
			<div class="grid gap-1 flex-auto">
				<div class="text-xs opacity-70">Total Pengguna</div>
				<div class="text-xl">{stat.user}</div>
			</div>
			<div>
				<div class="p-2 rounded-2xl bg-base-200">
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
	</a>
	<!-- <a
		class="w-full grid gap-2 p-4 bg-base-100 rounded-lg hover:ring hover:ring-primary"
		href="dashboard/product"
	>
		<div class="flex gap-2">
			<div class="grid gap-1 flex-auto">
				<div class="text-xs opacity-70">Total Product</div>
				<div class="text-xl">{stat.product}</div>
			</div>
			<div>
				<div class="p-2 rounded-2xl bg-base-200">
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
	</a> -->
	<a
		class="w-full grid gap-2 p-4 bg-base-100 rounded-lg hover:ring hover:ring-primary"
		href="dashboard/order"
	>
		<div class="flex gap-2">
			<div class="grid gap-1 flex-auto">
				<div class="text-xs opacity-70">Total Pesanan</div>
				<div class="text-xl">{stat.order}</div>
			</div>
			<div>
				<div class="p-2 rounded-2xl bg-base-200">
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
	</a>
	<a
		class="w-full grid gap-2 p-4 bg-base-100 rounded-lg hover:ring hover:ring-primary"
		href="dashboard/sale"
	>
		<div class="flex gap-2">
			<div class="grid gap-1 flex-auto">
				<div class="text-xs opacity-70">Total Penjualan</div>
				<div class="text-xl">Rp. {Currency.toMoney(stat.sales)}</div>
			</div>
			<div>
				<div class="p-2 rounded-2xl bg-base-200">
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
	</a>
	<!-- <a
		class="w-full grid gap-2 p-4 bg-base-100 rounded-lg hover:ring hover:ring-primary"
		href="dashboard/subscriber"
	>
		<div class="flex gap-2">
			<div class="grid gap-1 flex-auto">
				<div class="text-xs opacity-70">Subscribers</div>
				<div class="text-xl">{stat.subscriber} User</div>
			</div>
			<div>
				<div class="p-2 rounded-2xl bg-base-200">
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
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/></svg
					>
				</div>
			</div>
		</div>
	</a> -->
{:else}
	{#each fake as value}
		<section class="grid gap-2 p-4 bg-base-100 rounded-lg w-full">
			<div class="flex gap-2">
				<div class="grid gap-1 flex-auto">
					<div class="text-transparent bg-base-200 rounded animate-pulse">&nbsp;</div>
					<div class="text-transparent bg-base-200 rounded animate-pulse">&nbsp;</div>
				</div>
				<div>
					<div class="p-2 rounded-2xl text-transparent bg-base-200 animate-pulse">
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
			<div class="text-transparent bg-base-200 rounded animate-pulse">&nbsp;</div>
		</section>
	{/each}
{/if}
