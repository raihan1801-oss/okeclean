<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';

	import Progress from '$components/progress.svelte';

	import { goto } from '$app/navigation';

	import type { ClientApi } from '$apis/index';
	import type { Service } from '$lib/service-register';
	import type { User } from '$lib/store';

	const title = 'Logout';
	const desc = 'Logging Out';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');
	const service = getContext<Service>('service');

	let user_login = $user;
	let loader: Progress;

	onMount(async () => {
		try {
			await client.ready;
			await client.user.token.remove();
			service.register('/service-worker.js');
			if (user_login) {
				// service.subscribe({
				// 	role: 'internal',
				// 	userId: user_login.id,
				// 	nodeId: user_login.chatNodeId
				// });
				user.unset();
			}
			await goto('/admin/signin', { replaceState: true });
		} catch (error: any) {
			console.error(error);
		} finally {
			loader.hiding();
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Progress bind:this={loader} />
