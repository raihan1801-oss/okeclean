<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../_appbar.svelte';
	import DrawerContent from '../_drawer.svelte';
	import FooterContent from '../_footer.svelte';

	import { page } from '$app/stores';
	import { Diff, wait } from '$lib/helper';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'User';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let progress: Progress;

	let role = $page.params.role;
	let id = +$page.params.id;
	let profile: ClientApi.User | undefined;
	let copy: any = {};
	let file: File | undefined;
	let disable_save = true;
	let disable_delete = false;

	$: {
		if (profile) {
			const changed = Diff.object(copy, profile);
			if (changed) {
				disable_save = false;
			} else {
				disable_save = true;
			}
		}
	}

	onMount(init);

	async function init() {
		try {
			await client.ready;
			profile = await client.user.get({ id });
			copy = Diff.objectCopy(profile);
		} catch (error: any) {
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
		} finally {
		}
	}
	async function save() {
		try {
			progress.showing();
			disable_save = disable_delete = true;

			if (!profile) throw new Error('');

			const changed = Diff.object(copy, profile);

			if (changed) {
				if (changed.image && file) {
					changed.image = await client.user.uploadImage(`${id}/${file.name}`, file);
					await client.user.update({
						where: { id },
						data: { ...changed }
					});
				}
			}
		} catch (error: any) {
			disable_save = false;
		} finally {
			progress.hiding();
		}
	}
	async function remove() {
		try {
			progress.showing();
			disable_save = disable_delete = true;

			if (!profile) throw new Error('');

			await client.user.delete({ id: profile.id });

			profile = undefined;

			history.back();
		} catch (error: any) {
			disable_delete = false;
		} finally {
			progress.hiding();
		}
	}
	function inputFile(this: HTMLInputElement) {
		file = this.files?.[0];
		if (file && profile) {
			profile.image = URL.createObjectURL(file);
			profile = profile;
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="bg-neutral text-neutral-content">
	<section transition:slide class="flex">
		<Drawer show={drawerOpened} class="bg-base-100">
			<DrawerContent />
		</Drawer>
		<Content class="flex-grow">
			<Appbar class="bg-base-100">
				<AppbarContent bind:account bind:mode bind:drawerOpened />
			</Appbar>
			<Progress bind:this={progress} />
			<Main>
				<section>
					<div class="text-2xl font-bold">{title}</div>
				</section>
				<form on:submit|preventDefault={save} class="grid p-6 bg-base-100 rounded-lg">
					{#if profile}
						<div class="grid gap-12 w-[320px] justify-self-center">
							<div class="grid gap-4">
								<div class="grid justify-center">
									<div class="avatar placeholder justify-self-center">
										<div
											class="bg-base-200 text-base-content rounded-full w-16 h-16 relative hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
										>
											<input
												on:input={inputFile}
												id="image"
												type="file"
												accept="image"
												class="opacity-0 w-full h-full absolute cursor-pointer"
											/>
											{#if profile.image}
												<img
													src={profile.image}
													alt={profile.name}
													class="object-cover object-center"
												/>
											{:else}
												<svg
													class="w-8 h-8"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
													><path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/></svg
												>
											{/if}
										</div>
									</div>
									<label for="image" class="label cursor-pointer">
										<div class="label-text">Upload Image</div>
									</label>
								</div>
								<div class="form-control">
									<label for="username" class="label">
										<span class="label-text">Username</span>
									</label>
									<input
										bind:value={profile.name}
										id="username"
										type="text"
										autocomplete="username"
										placeholder="Username"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text">Email</span>
									</label>
									<input
										bind:value={profile.email}
										id="email"
										type="text"
										autocomplete="email"
										placeholder="Email"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text">Phone Number</span>
									</label>
									<input
										bind:value={profile.telp}
										id="tel"
										type="tel"
										autocomplete="tel"
										placeholder="Phone Number"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
								<div class="form-control">
									<label class="label cursor-pointer">
										<span class="label-text">Verified</span>
										<input type="checkbox" class="toggle" bind:checked={profile.verified} />
									</label>
								</div>
							</div>
							<div class="grid grid-flow-col gap-4">
								<button
									type="submit"
									disabled={disable_save}
									class="btn btn-primary {disable_save ? 'btn-disabled' : ''}">Save</button
								>
								<button
									type="button"
									disabled={disable_delete}
									class="btn btn-error {disable_delete ? 'btn-disabled' : ''}"
									on:click={remove}>Delete</button
								>
							</div>
						</div>
					{:else}
						<div class="grid gap-12 w-[320px] justify-self-center">
							<div class="grid justify-center">
								<div class="avatar placeholder justify-self-center">
									<div class="w-16 h-16 relative bg-base-200 rounded-full animate-pulse">
										<div class="object-cover object-center" />
									</div>
								</div>
							</div>
							<div class="grid gap-4">
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
							</div>
							<button
								type="submit"
								disabled={disable_save}
								class="btn btn-primary {disable_save ? 'btn-disabled' : ''}">Save</button
							>
						</div>
					{/if}
				</form>
			</Main>
			<div class="flex-grow" />
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
</style>
