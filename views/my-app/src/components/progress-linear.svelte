<script context="module" lang="ts">
	import { ProgressLinear as ProgressLinearLib } from 'svelte-materialify/src';

	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';

	import SequenceLoading from '$lib/sequence-loading';

	interface Props {
		class: string;
		backgroundColor: string;
		color: string;
	}
	interface Methods {
		loading(opts?: Options): void;
		loaded(): void;
	}
	interface Event {
		loaded: {};
	}
	interface Slots {}
	interface Options {
		indeterminate?: boolean;
		sequence?: boolean;
	}
	export interface ProgressLinear
		extends Svelte2TsxComponent<Props, Event, Slots>,
			Methods {}

	const defOpts: Required<Options> = {
		sequence: false,
		indeterminate: true,
	};
	const sequence = new SequenceLoading();
</script>

<script lang="ts">
	import { page, navigating } from '$app/stores';

	$: {
		if ($navigating) {
			loading();
		}
	}

	export const active = writable(true);
	const progress = writable(0);
	const indeterminate = writable(true);
	let classname = '';
	export { classname as class };
	export let backgroundColor = 'secondary-color';
	export let color = 'secondary-color';
	export function sequencing(timeout = 2000) {
		return new Promise((resolve) => {
			sequence.timeout = timeout;
			sequence.start({
				begin() {
					$indeterminate = false;
					$active = true;
				},
				load(chunk) {
					$progress = chunk;
				},
				preEnd() {
					$active = false;
				},
				end() {
					$indeterminate = true;
					$progress = 0;
					resolve(true);
				},
			});
		});
	}
	export function loading() {
		$active = true;
	}
	export function loaded() {
		$active = false;
	}
</script>

<ProgressLinearLib
	class="{classname}"
	active="{$active}"
	value="{$progress}"
	indeterminate="{$indeterminate}"
	backgroundColor="{backgroundColor}"
	color="{color}" />

<style lang="scss">
	* :global {
		.s-progress-linear {
			position: sticky !important;
			top: 0;
			background-color: white !important;
			z-index: 5;
		}
	}
</style>
