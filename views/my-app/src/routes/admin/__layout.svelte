<script context="module" lang="ts">
	export const router = true;
	export const hydrate = true;
	export const prerender = true;

	import { onMount, onDestroy, getContext, setContext } from 'svelte';
	// import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { wait } from '$lib/helper';
	import { session } from '$app/stores';
</script>

<script lang="ts">
	import '../../app.css';

	import { ClientApi } from '$apis/index';
	import { APIS_URL, FETCH_MODE, WS_URL, ES_URL } from '$lib/env';
	import { Service } from '$lib/service-register';
	import { user, setting } from '$lib/store';
	import { dev } from '$app/env';

	export type { Setting, User } from '$lib/store';
	export type { ClientApi, Service };
	import Page from '$components/page.svelte';
	import Splash from './_splash.svelte';

	const service = new Service({ debug: dev });
	const clientApi = new ClientApi({
		base: APIS_URL,
		esbase: ES_URL,
		wsbase: WS_URL,
		debug: dev,
		mode: FETCH_MODE,
		role: 'admin',
		version: 'v0-alpha.1'
	});
	setContext('clientApi', clientApi);
	setContext('service', service);
	setContext('user', user);
	setContext('setting', setting);

	let open = $session.splashed;
	let progress = 10;
	let message = 'Initialize';
	let is_failed = false;

	onMount(async () => {
		try {
			service.init();
			clientApi.init();

			await clientApi.ready;

			progress = 30;
			const data = await clientApi.user.auth();
			message = 'Aunthenticated';

			progress = 60;
			user.set(data);
			message = `Welcome ${data.name}`;
			progress = 100;

			if (!$session.splashed) {
				$session = { splashed: true };
			}
		} catch (error: any) {
			is_failed = true;
			message = `Error: ${error.message}`;
			progress = 60;
			await wait({ timeout: 500 });

			if (error.type == clientApi.stdApi.Error.FailedAuthentication.type) {
				message = 'Redirecting';
				progress = 100;
				await wait({ timeout: 500 });
				$session = { splashed: true };
				if (!location.pathname.startsWith('/admin/sign')) {
					await goto('/admin/signin', { replaceState: true });
				}
			}
		} finally {
			await wait({ timeout: 500 });
			open = true;
		}
	});
	onDestroy(async () => {});
</script>

<!-- <slot /> -->

{#if !open}
	<Page class="bg-neutral text-neutral-content">
		<Splash {progress} {message} {is_failed} />
	</Page>
{:else}
	<slot />
{/if}

<style lang="postcss" global>
	body,
	.page {
		display: grid;
		min-height: 100vh;
		max-width: 100vw;
	}
	::-webkit-scrollbar {
		width: 16px;
	}
	::-webkit-scrollbar:hover {
		width: 16px;
	}
	::-webkit-scrollbar-track {
		@apply bg-base-200;
	}
	::-webkit-scrollbar-thumb {
		@apply bg-base-300;
		border: 4px solid transparent;
		border-radius: 100px;
		background-clip: content-box;
	}
	::-webkit-scrollbar-thumb:hover {
		@apply bg-primary;
	}
	/* .toggle[type='checkbox'] {
		background-image: none;
	}
	.toggle[type='checkbox']:checked:hover {
		background-color: var(--chkbg);
	}
	.toggle[type='checkbox']:checked:focus {
		background-color: var(--chkbg);
	}
	.toggle[type='checkbox']:focus {
		box-shadow: calc(var(--handleoffset) * -1) 0 0 2px hsl(var(--b1)) inset,
			0 0 0 2px hsl(var(--b1)) inset, var(--focus-shadow), 0px 0px 0px 2px hsl(var(--b1)),
			0px 0px 0px 4px hsl(var(--p));
	}
	.toggle[type='checkbox']:checked:focus {
		box-shadow: var(--handleoffset) 0 0 2px hsl(var(--b1)) inset, 0 0 0 2px hsl(var(--b1)) inset,
			var(--focus-shadow), 0px 0px 0px 2px hsl(var(--b1)), 0px 0px 0px 4px hsl(var(--p));
	}
	.toggle[type='checkbox']:hover {
		box-shadow: calc(var(--handleoffset) * -1) 0 0 2px hsl(var(--b1)) inset,
			0 0 0 2px hsl(var(--b1)) inset, var(--focus-shadow), 0px 0px 0px 2px hsl(var(--b1)),
			0px 0px 0px 4px hsl(var(--p));
	}
	.toggle[type='checkbox']:checked:hover {
		box-shadow: var(--handleoffset) 0 0 2px hsl(var(--b1)) inset, 0 0 0 2px hsl(var(--b1)) inset,
			var(--focus-shadow), 0px 0px 0px 2px hsl(var(--b1)), 0px 0px 0px 4px hsl(var(--p));
	}
	.stack.stack-x > :first-child {
		transform: translateX(0) scale(1);
		z-index: 3;
		opacity: 1;
	}
	.stack.stack-x > :nth-child(2) {
		transform: translateX(0.5rem) scale(0.95);
		z-index: 2;
		opacity: 0.8;
	}
	.stack.stack-x > * {
		grid-column-start: 1;
		grid-row-start: 1;
		transform: translateX(1rem) scale(0.9);
		z-index: 1;
		width: 100%;
		opacity: 0.6;
	} */
	/* html {
		scrollbar-width: thin;
		scrollbar-color: #4b5563 #9ca3af;
		transition: scrollbar-color 0.3s ease-out;
	}
	html:hover {
		scrollbar-color: #456bba #9ca3af;
	} */
</style>
