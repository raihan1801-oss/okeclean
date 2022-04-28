<script context="module" lang="ts">
	import { Alert, Icon } from 'svelte-materialify/src';
	import { mdiCheck, mdiClose } from '@mdi/js';

	import { writable } from 'svelte/store';
</script>

<script lang="ts">
	const activator = writable(false);
	const text = writable('');
	const state = writable<'success-color' | 'error-color'>('success-color');

	export function show() {
		activator.update(() => true);
	}
	export function hide() {
		activator.update(() => false);
	}
	export function setState(value: 'success' | 'error') {
		let stateValue: 'success-color' | 'error-color' = 'success-color';
		if (value == 'success') {
			stateValue = 'success-color';
		} else if (value == 'error') {
			stateValue = 'error-color';
		}
		state.set(stateValue);
	}
	export function setText(value: string) {
		text.update(() => value);
	}
</script>

<div class="alert">
	<Alert class="{$state}" bind:visible="{$activator}" border="left">
		<div slot="icon">
			{#if $state == 'success-color'}
				<Icon path="{mdiCheck}" />
			{:else if $state == 'error-color'}
				<Icon path="{mdiClose}" />
			{/if}
		</div>
		{$text}
	</Alert>
</div>

<style lang="scss">
	.alert {
		overflow-wrap: anywhere;
	}
</style>
