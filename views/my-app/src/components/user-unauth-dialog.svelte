<script lang="ts" context="module">
	import {
		Dialog,
		Card,
		CardTitle,
		CardText,
		CardActions,
		Button,
	} from 'svelte-materialify/src';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	export let active = false;
	export let basepath = '';
	export let role = '';
</script>

<Dialog persistent bind:active>
	<Card>
		<CardTitle>Anda belum masuk</CardTitle>
		<CardText>Untuk mengakses halaman ini di perlukan akun.</CardText>
		<CardActions>
			<Button
				on:click="{() =>
					goto(`${basepath}/entry/register`, { replaceState: true })}"
				text>Mendaftar</Button
			>
			<Button
				on:click="{() =>
					goto(`/entry/login?role=` + role, { replaceState: true })}"
				text
				class="primary-text">Masuk</Button
			>
		</CardActions>
	</Card>
</Dialog>
