<script lang="ts">
	import {
		Dialog,
		Card,
		TextField,
		Button,
		Icon,
		Alert,
	} from 'svelte-materialify/src';
	import { mdiCheck, mdiClose, mdiEye, mdiEyeOff } from '@mdi/js';
	import { createEventDispatcher } from 'svelte';
	import * as rules from '$lib/rules';

	const event = createEventDispatcher<{
		submit: { email: string; username: string; password: string };
		cancel: {};
	}>();

	export let active = false;
	export let message: {
		state?: 'success' | 'error';
		text?: string;
		show: boolean;
	} = {
		state: 'error',
		text: '',
		show: false,
	};
	export let data = {
		email: '',
		username: '',
	};
	export let password = '';

	let showAlert = false;
	let passwordError = false;
	let disableSubmit = true;
	let submitted = false;
	let showPassword = false;

	$: {
		if (active == false && submitted == false) {
			event('cancel');
		}
	}
	$: {
		if (password && !passwordError) {
			disableSubmit = false;
		} else {
			disableSubmit = true;
		}
	}
	function togglePass() {
		showPassword = !showPassword;
	}
	function submit() {
		if (!submitted) {
			submitted = true;
			event('submit', {
				...data,
				password,
			});
			disableSubmit = true;
		}
	}
</script>

<Dialog bind:active>
	<Card>
		<form on:submit|preventDefault="{submit}">
			<fieldset>
				<legend>Daftar Penjual</legend>
				<Alert
					class="{message.state}-color"
					visible="{message.show}"
					border="left">
					<div slot="icon">
						{#if message.state == 'success'}
							<Icon path="{mdiCheck}" />
						{:else if message.state == 'error'}
							<Icon path="{mdiClose}" />
						{/if}
					</div>
					{message.text}
				</Alert>
				<TextField
					type="email"
					autocomplete="email"
					outlined
					value="{data.email}"
					readonly>Email</TextField>
				<TextField
					type="text"
					autocomplete="username"
					outlined
					value="{data.username}"
					readonly>Username</TextField>
				<TextField
					outlined
					bind:value="{password}"
					rules="{rules.password}"
					bind:error="{passwordError}"
					type="{showPassword ? 'text' : 'password'}"
					autocomplete="new-password"
					><div>Password</div>
					<Button
						fab
						icon
						text
						size="small"
						slot="append"
						on:click="{togglePass}">
						<Icon
							class="grey-text text-darken-3"
							path="{showPassword ? mdiEyeOff : mdiEye}" />
					</Button></TextField>
			</fieldset>
			<fieldset>
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					type="submit"
					disabled="{disableSubmit}">Daftar</Button>
			</fieldset>
		</form>
	</Card>
</Dialog>

<style lang="scss">
	form {
		padding: 24px 16px;
		display: grid;
		row-gap: 24px;
	}
	fieldset {
		display: grid;
		row-gap: 16px;
		border: none;
	}
	legend {
		display: grid;
		place-items: center;
	}
</style>
