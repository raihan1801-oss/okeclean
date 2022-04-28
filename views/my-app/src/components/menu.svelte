<script context="module" lang="ts">
	import { getContext, setContext, tick } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { cubicOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
</script>

<script lang="ts">
	const self_value = writable<string | number | boolean>();

	setContext('valuable', self_value);

	let classname = '';
	let target = '';
	let element: HTMLUListElement | undefined;

	export { classname as class, target as for };
	export let transition = scale;
	export let show = false;
	export let right = false;
	export let bottom = true;
	export let fill = false;
	export let offset = 8;
	export let force = false;
	export let value: string | number | boolean = '';

	self_value.subscribe((s_value) => {
		if (s_value != undefined || s_value != null) {
			value = s_value;
		}
	});

	function init(node: HTMLUListElement) {
		const { height, pageTop, width, pageLeft } = visualViewport;
		const { offsetHeight: offsetHeightNode, offsetLeft: offsetLeftNode } = node;

		let parentElement: HTMLElement;
		if (target) {
			parentElement = document.getElementById(target) as HTMLElement;
		} else {
			parentElement = node.parentElement as HTMLElement;
		}
		if (!parentElement) {
			parentElement = node.parentElement as HTMLElement;
		}

		const { offsetHeight, offsetTop, offsetWidth, offsetLeft } = parentElement;

		let top = offsetTop + offsetHeight + offset;
		let left = offsetLeft;
		if (bottom) {
			const pageHeight = height + pageTop;
			const elementHeight = top + offsetHeightNode;
			console.log(elementHeight, pageHeight);
			if (elementHeight > pageHeight) {
				top -= offsetHeightNode + offset * 2 + offsetHeight;
			}
			node.style.top = top + 'px';
			node.style.left = left + 'px';
		}
		element = node;
		addListener();
	}
	function addListener() {
		document.addEventListener('click', listener, { capture: true });
	}
	function removeListener() {
		element = undefined;
		document.removeEventListener('click', listener, { capture: true });
	}
	function listener(event: MouseEvent) {
		let node = element as HTMLElement;
		if (node.contains(event.target as Element)) {
			if (force) {
				setTimeout(() => {
					removeListener();
					show = false;
				}, 250);
			}
		} else {
			removeListener();
			show = false;
		}
	}
</script>

{#if show}
	<ul use:init transition:transition class="absolute flex flex-col py-2 rounded-md {classname}">
		<slot {value} store_value={self_value} />
	</ul>
{/if}

<style lang="scss">
	ul {
		z-index: 1;
	}
</style>
