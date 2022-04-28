<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	import { wait } from '$lib/helper';
	import logo from '$lib/assets/logo.png';

	// import type { ClientApi, User } from '../__layout.svelte';
</script>

<script lang="ts">
	// const client = getContext<ClientApi>('clientApi');
	// const user = getContext<User>('user');
	const progress = tweened(10, {
		duration: 250,
		easing: cubicOut
	});
	let message = '';

	export let success = false;
	export let failed = false;
	export let error_type: any = '';

	onMount(async () => {
		try {
			$progress = 30;

			// await client.ready;
			$progress = 50;

			// const result = await client.internal.auth();
			$progress = 70;

			await wait({ timeout: 500 });
			// user.set(result);
			$progress = 90;

			await wait({ timeout: 500 });
			message = 'Welcome ' /* + result.username */;
			$progress = 100;

			await wait({ timeout: 500 });
			success = true;
		} catch (error: any) {
			failed = true;
			message = error.message;
			error_type = error.type;
		}
	});
</script>

<section transition:fade class="page place-content-center place-items-center">
	<section class="w-[180px] grid gap-10 bg-transparent rounded-md px-4 py-6">
		<img src={logo} alt="" width="72" height="72" class="justify-self-center" />
		<progress
			value={$progress}
			max="100"
			class="progress bg-base-100 transition-all {failed ? 'progress-error' : 'progress-primary'}"
		/>
	</section>
	<div>
		{#if message}
			<div transition:fade class="{failed ? 'text-error' : 'text-success'} text-center text-sm">
				{message}
			</div>
		{/if}
	</div>
</section>
