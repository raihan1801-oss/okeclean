<script lang="ts" context="module">
	import {
		Button,
		Icon,
		Checkbox,
		Snackbar,
		Alert,
		TextField,
		Textarea,
		ListItemGroup,
		ListItem,
		Menu,
	} from 'svelte-materialify/src';
	import { writable } from 'svelte/store';
</script>

<script lang="ts">
	export const active = writable(false);
	export const text = writable('Aplikasi membutuhkan lokasi');
	export const state = writable<'granted' | 'denied' | 'prompt'>('prompt');
	export const button = writable(true);
</script>

<Snackbar
	class="justify-space-between"
	bind:active="{$active}"
	bottom
	center>
	<div>{$text}</div>
	{#if $button}
		<Button
			text
			on:click="{() => {
				$state = 'granted';
				$active = false;
			}}">Ijinkan</Button>
	{/if}
</Snackbar>
