<script context="module" lang="ts">
	import { getContext, setContext, tick } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { cubicOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
</script>

<script lang="ts">
	let classname = '';
	let target = '';
	let element: HTMLDialogElement;
	let parentElement: HTMLElement;
	let overlay: HTMLElement;

	export { classname as class, target as for };
	export let transition = scale;
	export let show = false;
	export let force = false;

	$: {
		if (!show) {
			removeListener();
		}
	}

	function init(node: HTMLDialogElement) {
		element = node;
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.style.cssText = `position: absolute;display: grid;width: 100%;height: 100%;top: 0;left: 0;backdrop-filter: brightness(0.5);`;
		}
		if (target) {
			parentElement = document.getElementById(target) as HTMLElement;
		} else {
			parentElement = node.parentElement as HTMLElement;
		}
		if (!parentElement) {
			parentElement = node.parentElement as HTMLElement;
		}
		if (parentElement.children[0] != element) {
			parentElement.prepend(element);
		}
		draw();
		addListener();
	}
	function addListener() {
		parentElement.style.position = 'relative';
		parentElement.prepend(overlay);
		overlay.addEventListener('click', listener, { capture: true });
	}
	function removeListener() {
		if (parentElement) {
			parentElement.style.position = 'relative';
			overlay.remove();
			overlay.removeEventListener('click', listener, { capture: true });
		}
	}
	function listener(event: MouseEvent) {
		let node = element as HTMLElement;
		if (node.contains(event.target as Element)) {
			if (force) {
				setTimeout(() => {
					show = false;
				}, 250);
			}
		} else {
			show = false;
		}
	}
	function draw() {
		const { offsetWidth, offsetHeight } = parentElement;
		const { offsetWidth: offsetWidthChild, offsetHeight: offsetHeightChild } = element;
		const left = (offsetWidth - offsetWidthChild) / 2;
		const top = (offsetHeight - offsetHeightChild) / 2;
		element.style.top = '25%';
		element.style.left = left + 'px';
	}
</script>

{#if show}
	<dialog open use:init transition:transition class="sticky rounded-md p-4 {classname}">
		<slot />
	</dialog>
{/if}

<style lang="scss">
	dialog {
		z-index: 2;
	}
</style>
