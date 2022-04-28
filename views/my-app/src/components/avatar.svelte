<script context="module" lang="ts">
	import { cubicOut } from 'svelte/easing';
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let account: { image?: string | null; title: string; subtitle: string } | undefined =
		undefined;
	export let transition = (node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut }) => {
		return {
			delay,
			duration,
			easing
		};
	};
</script>

<div transition:transition class="flex gap-2 {classname}">
	{#if account}
		{#if account.image}
			<div class="w-10 h-10 m-1">
				<img
					src={account.image}
					alt="Profile"
					on:error={() => {
						if (account) {
							account.image = '';
							account = account;
						}
					}}
					class="aspect-1 object-cover object-center rounded-md"
				/>
			</div>
		{:else}
			<div class="w-10 h-10 m-1 aspect-1 rounded-full grid place-items-center bg-base-200">
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
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/></svg
				>
			</div>
		{/if}
		<span class="flex flex-col justify-evenly">
			<div class="text-sm text-left font-semibold">{account.title}</div>
			<div class="text-xs text-left overflow-ellipsis">{account.subtitle}</div>
		</span>
	{:else}
		<div class="m-1 w-10 h-10 grid place-items-center rounded-full animate-pulse bg-base-200" />
		<span class="flex-grow grid content-evenly">
			<div class="text-sm font-semibold animate-pulse bg-base-200">&nbsp;</div>
			<div class="text-xs animate-pulse bg-base-200">&nbsp;</div>
		</span>
	{/if}
</div>

<style lang="scss">
	.aspect-1 {
		aspect-ratio: 1;
	}
</style>
