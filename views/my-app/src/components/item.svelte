<script context="module" lang="ts">
	import { cubicOut } from 'svelte/easing';
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let startOnly = false;
	export let transition = (node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut }) => {
		return {
			delay,
			duration,
			easing
		};
	};
</script>

<div transition:transition class="flex items-center gap-4 {classname}">
	{#if startOnly}
		{#if $$slots.start}
			<slot name="start" />
		{/if}
	{:else}
		{#if $$slots.start}
			<slot name="start" />
		{/if}
		<div class="flex flex-col justify-items-center justify-evenly gap-3">
			<slot />
			{#if $$slots.sub}
				<slot name="sub" />
			{/if}
		</div>
		{#if $$slots.end}
			<slot name="end" />
		{/if}
	{/if}
</div>

<style lang="scss">
</style>
