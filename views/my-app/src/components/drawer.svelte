<script context="module" lang="ts">
	import { cubicOut, linear } from 'svelte/easing';

	export function slide(node: HTMLElement, { delay = 0, duration = 400 }) {
		const style = getComputedStyle(node);
		const opacity = +style.opacity;
		const width = parseFloat(style.width);
		const padding_left = parseFloat(style.paddingLeft);
		const padding_right = parseFloat(style.paddingRight);
		const margin_left = parseFloat(style.marginLeft);
		const margin_right = parseFloat(style.marginRight);
		const border_left_width = parseFloat(style.borderLeftWidth);
		const border_right_width = parseFloat(style.borderRightWidth);
		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number) => {
				return (
					`overflow-x: hidden;` +
					`width: ${t * width}px;` +
					`padding-left: ${t * padding_left}px;` +
					`padding-right: ${t * padding_right}px;` +
					`margin-left: ${t * margin_left}px;` +
					`margin-right: ${t * margin_right}px;` +
					`border-left-width: ${t * border_left_width}px;` +
					`border-right-width: ${t * border_right_width}px;`
				);
			}
		};
	}
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let fixed = false;
	export let sticky = true;
	export let strict = false;
	export let show = true;
	export let min_width = true;
	export let transition = slide;
</script>

{#if show}
	<aside
		transition:transition
		class="flex flex-col gap-4 {classname}"
		class:fixed
		class:sticky
		class:strict
		class:min_width
	>
		<slot />
	</aside>
{:else}
	<div />
{/if}

<style lang="scss">
	aside {
		height: 100vh;
		padding-bottom: 16px;
		overflow-y: auto;
	}
	.min_width {
		width: 250px;
	}
	.strict {
		contain: strict;
	}
	.pos-top {
		top: 0;
	}
	.fixed {
		@extend .pos-top;
		position: fixed;
	}
	.sticky {
		@extend .pos-top;
		position: sticky;
	}
</style>
