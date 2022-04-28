<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	import SideBar from '../_side-bar.svelte';
	import AppBar from '../_app-bar.svelte';
	import Main from '../_main.svelte';
	import Footer from '../_footer.svelte';
	import Progress from '$components/progress.svelte';

	import { goto } from '$app/navigation';

	import { Diff } from '$lib/helper';

	import type { ClientApi, User } from '../__layout.svelte';

	const title = 'Model';
	const desc = 'Model';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode: 'light' | 'dark' = 'dark';
	let loader: Progress;
	let config: ClientApi.Admin.Data['model'];
	let disable = false;
	let copy: any;
	let errorText = '';

	$: start(config);

	onMount(async () => {
		try {
			await client.ready;

			if (!$user) {
				return goto('/admin', {replaceState: true});
			}

			config = await client.admin.getModel();
			copy = Diff.objectCopy(config);
		} catch (error: any) {
			console.error(error);
		} finally {
			loader.hiding();
		}
	});

	async function start(arg: any) {
		if (copy) {
			const changed = Diff.object(copy, config);
			if (changed) {
				try {
					loader.showing();

					disable = true;

					config = await client.admin.setModel(config);

					Diff.objectAssign(copy, config);
				} catch (error: any) {
					errorText = error.message;
					config = Diff.objectCopy(copy);
				} finally {
					disable = false;
					loader.hiding();
				}
			}
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<section
	transition:slide
	data-theme={mode}
	class="{mode} grid grid-flow-col grid-cols-[2.5fr,9.5fr] bg-base-100"
>
	<SideBar />
	<section class="flex flex-col">
		<AppBar bind:mode />
		<Progress bind:this={loader} />
		<Main>
			<section>
				<div class="text-3xl text-base-content font-bold">{title}</div>
			</section>
			<form class="grid bg-base-200 p-6 rounded-lg">
				<div class="grid gap-12 w-[320px] justify-self-center">
					<div class="grid gap-4">
						{#if config}
							<div class="form-control">
								<label class="cursor-pointer label">
									<span class="label-text">Start Studio Server</span>
									<input
										type="checkbox"
										disabled={disable}
										bind:checked={config.open}
										class="toggle toggle-primary"
									/>
								</label>
							</div>
							<div class="px-1 py-2 flex items-center text-sm">
								<div>Started By</div>
								<div class="flex-grow" />
								<div>{config.openBy || '-'}</div>
							</div>
							<div class="px-1 py-2 flex items-center text-sm">
								<div>Started At</div>
								<div class="flex-grow" />
								<div>{config.openAt || '-'}</div>
							</div>
							<div class="px-1 py-2">
								{#if config.link}
									<a href={config.link} class="link link-hover flex items-center text-sm">
										<div>Open Studio</div>
										<div class="flex-grow" />
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											class="w-6 h-6 fill-current"
											><path d="M0 0h24v24H0V0z" fill="none" /><path
												d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
											/></svg
										>
									</a>
								{:else}
									<div class="flex items-center text-sm text-base-content/70">
										<div>Open Studio</div>
										<div class="flex-grow" />
										<div>{config.openBy ?? '-'}</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="px-1 py2 bg-base-300 rounded min-h-8 animate-pulse">&nbsp;</div>
							<div class="px-1 py2 bg-base-300 rounded min-h-8 animate-pulse">&nbsp;</div>
							<div class="px-1 py2 bg-base-300 rounded min-h-8 animate-pulse">&nbsp;</div>
							<div class="px-1 py2 bg-base-300 rounded min-h-8 animate-pulse">&nbsp;</div>
						{/if}
					</div>
				</div>
			</form>
		</Main>
		<dir class="flex-grow" />
		<Footer />
	</section>
</section>

<style lang="scss"></style>
