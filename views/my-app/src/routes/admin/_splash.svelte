<script context="module" lang="ts">
	import { onMount, createEventDispatcher, getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// import { wait } from '$lib/helper';
</script>

<script lang="ts">
	// import type { ClientApi } from '$apis/index';
	// import type { User } from '$lib/store';


	// const client = getContext<ClientApi>('clientApi');
	// const user = getContext<User>('user');

	// const event_dispatcher = createEventDispatcher<{
	// 	complete: { is_success: boolean; error_type?: any };
	// }>();
	const progress_bar = tweened(10, {
		duration: 250,
		easing: cubicOut
	});
	export let progress = 0;
	export let message = '';
	export let is_success = false;
	export let is_failed = false;
	export let error_type: any = '';

	$: $progress_bar = progress;

	onMount(async () => {
		try {
			// await client.ready
			// $progress = 30;

			// const data = await client.user.auth()
			// $progress = 50;

			// user.set(data);
			// $progress = 70;

			// await wait({ timeout: 500 });
			// $progress = 90;

			// await wait({ timeout: 500 });
			// $progress = 100;
			// message = "Welcome";

			// await wait({ timeout: 500 });
			// is_success = true;
			// event_dispatcher('complete', { is_success });
		} catch (error: any) {
			// is_failed = true;
			// message = error.message;
			// error_type = error.type;
			// event_dispatcher('complete', { is_success, error_type });
		}
	});
</script>

<section transition:fade class="page place-content-center place-items-center">
	<section class="w-[180px] grid gap-10 bg-transparent rounded-md px-4 py-6">
		<img src="/logo.png" alt="" width="72" height="72" class="justify-self-center" />
		<progress
			value={$progress_bar}
			max="100"
			class="progress bg-base-100 transition-all {is_failed
				? 'progress-error'
				: 'progress-primary'}"
		/>
	</section>
	<div>
		{#if message}
			<div transition:fade class="{is_failed ? 'text-error' : 'text-success'} text-center text-sm">
				{message}
			</div>
		{/if}
	</div>
</section>
