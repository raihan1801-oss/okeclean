<script context="module" lang="ts">
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { cubicOut } from 'svelte/easing';

	import type { Writable } from 'svelte/store';
</script>

<script lang="ts">
	const parent_value: Writable<string | number | boolean> | undefined = getContext('valuable');
	let classname = '';
	export { classname as class };
	export let transition: any = (node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut }) => {
		return {
			delay,
			duration,
			easing
		};
	};
	export let value: string | number | boolean = '';
</script>

<li
	on:click={() => {
		parent_value?.set(value);
	}}
	transition:transition
	class={classname}
>
	<slot value={value} />
</li>

<style lang="scss">
</style>
