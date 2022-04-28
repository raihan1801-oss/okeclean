<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';

	const title = 'Sign Up';
	const desc = '';
</script>

<script lang="ts">
	import Progress from '$components/progress.svelte';
	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let loader: Progress;
	let showPass = false;
	let state: '' | 'success' | 'failed' = '';
	let errorMessage = '';
	let disable = false;

	let name = '';
	let email = '';
	let password = '';
	let role = 'admin';

	onMount(() => {
		loader.hiding();
	});

	function togglePass() {
		showPass = !showPass;
	}
	function onInputPass(this: HTMLInputElement) {
		password = this.value;
	}
	async function submit() {
		try {
			loader.showing();
			disable = true;

			const result = await client.user.register({
				name,
				email,
				password,
				role,
			});
			user.set(result);
			state = 'success';

			goto('/admin/', {replaceState: true});
		} catch (error: any) {
			state = 'failed';
			errorMessage = error.message;
		} finally {
			loader.hiding();
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<div transition:fade class="page p-8 bg-gray-200 dark:bg-gray-800 place-content-center">
	<Progress bind:this={loader} fixed />
	<section
		class="max-w-lg min-w-[300px] md:min-w-[380px] min-h-[500px] p-6 grid gap-6 rounded-xl dark:bg-gray-700 dark:text-gray-100"
	>
		<div class="grid gap-2 py-4">
			<h1 class="text-2xl text-center font-bold">Sign Up</h1>
			<p class="text-sm text-center text-gray-100/70">Sign Up to a new world.</p>
		</div>
		{#if state == 'success'}
			<output class="alert alert-success">
				<div class="grid grid-flow-col gap-2">
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<div class="text-justify">Sign Up Success</div>
				</div>
			</output>
		{:else if state == 'failed'}
			<output class="alert alert-error">
				<div class="grid grid-flow-col gap-2">
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<div class="text-justify">
						{errorMessage}
					</div>
				</div>
			</output>
		{/if}
		<form on:submit|preventDefault={submit} class="form-control grid gap-12">
			<div class="grid gap-4 items-start">
				<div class="grid gap-1 text-sm">
					<label
						for="username"
						class="label p-0 text-gray-200 text-opacity-70 focus:text-opacity-100"
					>
						<span class="label-text">Username</span>
					</label>
					<input
						id="username"
						type="text"
						autocomplete="username"
						placeholder="Username"
						required
						bind:value={name}
						class="input input-bordered bg-transparent focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-700"
					/>
				</div>
				<div class="grid gap-1 text-sm">
					<label for="email" class="label p-0 text-gray-200 text-opacity-70 focus:text-opacity-100">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						autocomplete="email"
						placeholder="Email"
						required
						bind:value={email}
						class="input input-bordered bg-transparent focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-700"
					/>
				</div>
				<div class="grid gap-1 text-sm">
					<label
						for="password"
						class="label p-0 text-gray-200 text-opacity-70 focus:text-opacity-100"
					>
						<span class="label-text">Password</span>
					</label>
					<div class="relative w-full">
						<input
							id="password"
							type={showPass ? 'text' : 'password'}
							autocomplete="current-password"
							placeholder="Password"
							required
							value={password}
							on:input|preventDefault={onInputPass}
							class="input input-bordered bg-transparent w-full focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-700"
						/>
						<div
							class="absolute top-0 right-0 grid place-content-center h-full"
							style="aspect-ratio: 1;"
						>
							<button
								type="button"
								class="btn btn-sm btn-square bg-transparent hover:bg-gray-600 border-0"
								on:click={togglePass}
							>
								{#if showPass}
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/></svg
									>
								{:else}
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/></svg
									>
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
			<button
				type="submit"
				class="btn btn-block bg-primary border-0 {disable ? 'btn-disabled' : ''}"
				disabled={disable}>Sign Up</button
			>
		</form>
		<p class="self-end text-xs text-center sm:px-6 dark:text-gray-400">
			Already have an account?
			<a href="/admin/signin" class="underline dark:text-gray-100">Sign In</a>
		</p>
	</section>
</div>
