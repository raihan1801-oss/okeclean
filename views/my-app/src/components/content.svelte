<script context="module" lang="ts">
	import { cubicOut } from 'svelte/easing';
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let transition = (node: HTMLElement, { delay = 0, duration = 400, easing = cubicOut }) => {
		return {
			delay,
			duration,
			easing
		};
	};
</script>

<section transition:transition class="flex flex-col {classname}">
	<slot />
</section>

<style lang="scss">
	section {
		min-height: 100vh;
	}
</style>
