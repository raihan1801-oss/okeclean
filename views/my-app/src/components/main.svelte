<script context="module" lang="ts">
	import { cubicOut } from 'svelte/easing';
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let node: HTMLElement | undefined = undefined;
	export let transition = (node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut }) => {
		return {
			delay,
			duration,
			easing
		};
	};
	function get_node(element: HTMLElement) {
		node = element;
	}
</script>

<main transition:transition use:get_node class="flex flex-col gap-6 p-6 {classname}">
	<slot />
</main>

<style lang="scss">
</style>
