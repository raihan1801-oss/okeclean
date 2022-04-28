<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	// import { slide } from 'svelte/transition';
	import { Diff, wait } from '$lib/helper';
	// import SideBar from '../_side-bar.svelte';
	// import AppBar from '../_app-bar.svelte';
	// import Main from '../_main.svelte';
	// import Footer from '../_footer.svelte';
	// import Progress from '$components/progress.svelte';
	// import Splash from '../_splash.svelte';

	import { goto } from '$app/navigation';

	// import type { ClientApi, User } from '../__layout.svelte';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Account';
	const desc = 'Account';
</script>

<script lang="ts">
	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../dashboard/_appbar.svelte';
	import DrawerContent from '../dashboard/_drawer.svelte';
	import FooterContent from '../dashboard/_footer.svelte';
	import List from '$components/list.svelte';
	import ListItem from '$components/list-item.svelte';

	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let file: File | undefined;
	let progress: Progress;
	let user_login = $user as ClientApi.User;
	// let loader: Progress;
	let profile: ClientApi.User = user_login;
	// let profile = {};
	let copy: any = {};
	let disable = false;

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			account = {
				image: user_login.image,
				name: user_login.name,
				role: user_login.role
			};
			// config = await client.admin.getBusiness();
			// slides = await client.admin.getSlide();
			// slides_image = new FormData();
			// copy = Diff.objectCopy({ config, slides });
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}

	$: copying($user);
	$: {
		if (profile) {
			const changed = Diff.object(copy, profile);
			if (changed) {
				disable = false;
			} else {
				disable = true;
			}
		}
	}

	function copying(user: ClientApi.User | null) {
		if (user) {
			profile = user;
			copy = Diff.objectCopy(user);
			wait({ timeout: 2000, callback: () => progress?.hiding() });
		}
	}
	async function save() {
		try {
			progress.showing();
			disable = true;

			const changed = Diff.object(copy, profile);
			if (!changed) throw new Error('');
			if (file) {
				changed.image = await client.user.uploadImage(`${profile.id}/${file.name}`, file);
			}
			const result = await client.user.update({
				where: { id: profile.id },
				data: changed
			});
			user.set(result);
			Diff.objectAssign(copy, result);
		} catch (error: any) {
			disable = false;
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
	<section transition:fade class="flex">
		<Drawer min_width={false} show={drawerOpened} class="bg-base-100 w-[300px]">
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
				<form on:submit|preventDefault={save} class="grid bg-base-100 p-6 rounded-lg">
					<div class="grid gap-12 w-[320px] justify-self-center">
						<div class="grid gap-4">
							<div class="grid justify-center">
								<div class="avatar placeholder justify-self-center">
									<div
										class="bg-base-200 text-base-content rounded-full w-16 h-16 relative cursor-pointer"
									>
										<input
											on:input={inputFile}
											id="image"
											type="file"
											accept="image"
											class="opacity-0 w-full h-full absolute"
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
								<label for="image" class="label">
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
									class="input input-ghost bg-base-200"
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
									class="input input-ghost bg-base-200"
								/>
							</div>
							<!-- <div class="form-control">
								<label for="name" class="label">
									<span class="label-text">Name</span>
								</label>
								<input
									bind:value={profile.name}
									id="name"
									type="text"
									autocomplete="name"
									placeholder="Name"
									class="input input-ghost bg-base-200"
								/>
							</div> -->
							<div class="form-control">
								<label for="nickname" class="label">
									<span class="label-text">Nickname</span>
								</label>
								<input
									id="nickname"
									type="text"
									autocomplete="nickname"
									placeholder="Nickname"
									class="input input-ghost bg-base-200"
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
									class="input input-ghost bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="datebirth" class="label">
									<span class="label-text">Datebirth</span>
								</label>
								<input
									id="datebirth"
									type="date"
									autocomplete="bday-day"
									placeholder="Datebirth"
									class="input input-ghost bg-base-200"
								/>
							</div>
							<div class="form-control">
								<label for="gender" class="label">
									<span class="label-text">Gender</span>
								</label>
								<select id="gender" class="select select-ghost bg-base-200">
									<option class="p-4" disabled selected>Choose your gender</option>
									<option class="p-4">Male</option>
									<option class="p-4">Female</option>
								</select>
							</div>
						</div>
						<button
							type="submit"
							disabled={disable}
							class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
						>
					</div>
				</form>
			</Main>
			<div class="flex-grow" />
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<!-- {#if profile}
	<section
		transition:slide
		class="grid grid-flow-col grid-cols-[2.5fr,9.5fr] bg-gray-200 dark:bg-gray-800"
	>
		<SideBar />
		<section class="grid content-start">
			<AppBar
				account={{ image: profile.image ?? '', name: profile.username, role: profile.role }}
			/>
			<Progress bind:this={loader} />
			<Main>
				<section>
					<div class="text-white text-3xl font-bold">Account</div>
				</section>
				<form on:submit|preventDefault={save} class="grid bg-base-200 p-6 rounded-lg">
					<div class="grid gap-12 w-[320px] justify-self-center">
						<div class="grid gap-4">
							<div class="grid justify-center">
								<div class="avatar placeholder justify-self-center">
									<div
										class="bg-base-300 text-base-content rounded-full w-16 h-16 relative cursor-pointer"
									>
										<input
											on:input={inputFile}
											id="image"
											type="file"
											accept="image"
											class="opacity-0 w-full h-full absolute"
										/>
										{#if profile.image}
											<img
												src={profile.image}
												alt={profile.username}
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
								<label for="image" class="label">
									<div class="label-text">Upload Image</div>
								</label>
							</div>
							<div class="form-control">
								<label for="username" class="label">
									<span class="label-text">Username</span>
								</label>
								<input
									bind:value={profile.username}
									id="username"
									type="text"
									autocomplete="username"
									placeholder="Username"
									class="input input-ghost bg-base-300"
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
									class="input input-ghost bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="name" class="label">
									<span class="label-text">Name</span>
								</label>
								<input
									bind:value={profile.name}
									id="name"
									type="text"
									autocomplete="name"
									placeholder="Name"
									class="input input-ghost bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="nickname" class="label">
									<span class="label-text">Nickname</span>
								</label>
								<input
									id="nickname"
									type="text"
									autocomplete="nickname"
									placeholder="Nickname"
									class="input input-ghost bg-base-300"
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
									class="input input-ghost bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="datebirth" class="label">
									<span class="label-text">Datebirth</span>
								</label>
								<input
									id="datebirth"
									type="date"
									autocomplete="bday-day"
									placeholder="Datebirth"
									class="input input-ghost bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="gender" class="label">
									<span class="label-text">Gender</span>
								</label>
								<select id="gender" class="select select-ghost bg-base-300">
									<option class="p-4" disabled selected>Choose your gender</option>
									<option class="p-4">Male</option>
									<option class="p-4">Female</option>
								</select>
							</div>
						</div>
						<button
							type="submit"
							disabled={disable}
							class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
						>
					</div>
				</form>
			</Main>
			<Footer />
		</section>
	</section>
{/if} -->

<style lang="scss"></style>
