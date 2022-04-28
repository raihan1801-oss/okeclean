<script lang="ts">
	const defAcc = {
		image: 'https://i.pravatar.cc/500?img=32',
		name: 'Name',
		role: 'Role'
	};
	export let opened = true;
	export let account = defAcc;
	export let mode: 'light' | 'dark' = 'dark';

	$: account = account.name == '' ? defAcc : account;
</script>

<header class="navbar gap-4 bg-base-200 text-base-content px-8">
	<div class="flex-none hidden lg:flex">
		<button on:click={() => (opened = !opened)} class="btn btn-square btn-ghost">
			{#if opened}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					class="inline-block w-7 h-7 fill-current"
					><path d="M0,0h24v24H0V0z" fill="none" /><path
						d="M4,18h11c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,17.55,3.45,18,4,18z M4,13h8c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1v0C3,12.55,3.45,13,4,13z M3,7L3,7c0,0.55,0.45,1,1,1h11c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H4C3.45,6,3,6.45,3,7z M20.3,14.88L17.42,12l2.88-2.88c0.39-0.39,0.39-1.02,0-1.41l0,0 c-0.39-0.39-1.02-0.39-1.41,0l-3.59,3.59c-0.39,0.39-0.39,1.02,0,1.41l3.59,3.59c0.39,0.39,1.02,0.39,1.41,0l0,0 C20.68,15.91,20.69,15.27,20.3,14.88z"
					/><path d="M0,0h24v24H0V0z" fill="none" /></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block w-6 h-6 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			{/if}
		</button>
	</div>
	<div class="flex-1 lg:flex">
		<div class="form-control">
			<div class="relative w-full">
				<div class="absolute top-0 left-0 grid place-content-center h-full" style="aspect-ratio: 1;">
					<button
						type="button"
						class="btn btn-sm btn-square bg-transparent hover:bg-base-300 border-0"
					>
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/></svg
						>
					</button>
				</div>
				<input
					aria-label="Search Box"
					id="search-box"
					type="search"
					placeholder="Search..."
					class="input input-bordered bg-transparent w-full pl-[50px] focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-gray-700"
				/>
			</div>
		</div>
	</div>
	<div class="flex-none">
		<div class="indicator">
			<div class="indicator-item badge badge-secondary badge-xs" />
			<button class="btn btn-square btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block w-6 h-6 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
			</button>
		</div>
	</div>
	<div class="flex-none">
		<button
			on:click={() => (mode = mode == 'dark' ? 'light' : 'dark')}
			class="btn btn-square btn-ghost"
		>
			{#if mode == 'dark'}
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
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/></svg
				>
			{:else if mode == 'light'}
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
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/></svg
				>
			{/if}
		</button>
	</div>
	<div class="flex-none">
		<div class="avatar gap-1">
			<div class="rounded-full w-10 h-10 m-1">
				<img src={account.image} alt="Profile" />
			</div>
			<span class="grid content-evenly">
				<div class="text-sm font-semibold">{account.name}</div>
				<div class="text-xs">{account.role}</div>
			</span>
		</div>
	</div>
</header>
