<script context="module" lang="ts">
	import { Snackbar } from 'svelte-materialify/src';
</script>

<script lang="ts">
	let classname = '';
	export let isShow = false;
	export let flow: string = 'justify-space-between';
	export let bottom = true;
	export let right = false;
	export let center = true;
	export let left = false;
	export let top = false;
	export let timeout = 3500;
	export let text = '';
	export { classname as class };
	export function show() {
		isShow = true;
	}
	export function hide() {
		isShow = false;
	}
	export function setText(value = '') {
		text = value;
	}
</script>

<Snackbar
	class="{flow}{classname}"
	bind:active="{isShow}"
	right="{right}"
	bottom="{bottom}"
	center="{center}"
	left="{left}"
	top="{top}"
	timeout="{timeout}">
	{text}
	<slot />
</Snackbar>
