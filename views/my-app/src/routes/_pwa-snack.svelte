<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Dialog, Card, TextField, Button, Icon, Alert } from 'svelte-materialify/src';
	import Snackbar from '$components/snackbar.svelte';

	export let state: 'install' | 'update' | '' = '';
	export let show = false;

	const dispatcher = createEventDispatcher<{ click: {} }>();

	$: {
		if (snackbar) {
			if (show) {
				snackbar.show();
			} else {
				snackbar.hide();
			}
		}
	}

	let snackbar: Snackbar;
</script>

<Snackbar bind:this={snackbar} timeout={5000}>
	{#if state == 'install'}
		<div>Oke Clean Installable</div>
		<div>
			<Button
				class="primary-color"
				on:click={() => {
					dispatcher('click');
				}}>Install</Button
			>
		</div>
	{:else if state == 'update'}
		<div>Oke Clean Updateable</div>
		<div>
			<Button
				class="primary-color"
				on:click={() => {
					dispatcher('click');
				}}>Update</Button
			>
		</div>
	{:else}
		<div />
	{/if}
</Snackbar>

<style lang="scss">
</style>
