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
	import { createEventDispatcher } from 'svelte';

	export let active = false;
	export let persistent = false;

	const event = createEventDispatcher<{ granted: {}; denied: {} }>();
</script>

<Dialog bind:active {persistent}>
	<Card>
		<CardTitle>Delete Account</CardTitle>
		<CardText>Are you sure want to delete account?</CardText>
		<CardActions>
			<Button
				on:click="{() => {
					event('granted');
				}}"
				text
				class="red-text">Yes</Button>
			<Button
				on:click="{() => {
					event('denied');
					active = false;
				}}"
				text>No</Button>
		</CardActions>
	</Card>
</Dialog>
