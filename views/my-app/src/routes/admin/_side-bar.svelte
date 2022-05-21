<script context="module" lang="ts">
	import { slide, scale } from 'svelte/transition';

	import { page } from '$app/stores';
</script>

<script lang="ts">
	export let show = true;
	const path = $page.url.pathname;
</script>

{#if show}
	<aside transition:slide class="side bg-gray-700">
		<header class="navbar py-4 px-8">
			<section class="w-full h-full relative">
				<img src="../logo.png" alt="Logo" class="h-full absolute" />
				<div class="block flex-auto text-center font-bold">Oke Clean</div>
			</section>
		</header>
		<nav class="grid gap-4">
			<ul class="grid gap-2 px-4">
				<li>
					<a
						href="/admin/dashboard"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/dashboard')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							data-name="Layer 1"
							viewBox="0 0 24 24"
							class="w-6 h-6"
							fill="none"
							><path
								fill="currentColor"
								d="M19.088,4.95453c-.00732-.00781-.00952-.01819-.01715-.02582s-.01819-.00995-.02606-.01733a9.97886,9.97886,0,0,0-14.08948,0c-.00787.00738-.01837.00964-.02606.01733s-.00983.018-.01715.02582a10,10,0,1,0,14.1759,0ZM12,20a7.9847,7.9847,0,0,1-6.235-3H9.78027a2.9636,2.9636,0,0,0,4.43946,0h4.01532A7.9847,7.9847,0,0,1,12,20Zm-1-5a1,1,0,1,1,1,1A1.001,1.001,0,0,1,11,15Zm8.41022.00208L19.3999,15H15a2.99507,2.99507,0,0,0-2-2.81573V9a1,1,0,0,0-2,0v3.18427A2.99507,2.99507,0,0,0,9,15H4.6001l-.01032.00208A7.93083,7.93083,0,0,1,4.06946,13H5a1,1,0,0,0,0-2H4.06946A7.95128,7.95128,0,0,1,5.68854,7.10211l.65472.65473A.99989.99989,0,1,0,7.75732,6.34277l-.65466-.65466A7.95231,7.95231,0,0,1,11,4.06946V5a1,1,0,0,0,2,0V4.06946a7.95231,7.95231,0,0,1,3.89734,1.61865l-.65466.65466a.99989.99989,0,1,0,1.41406,1.41407l.65472-.65473A7.95128,7.95128,0,0,1,19.93054,11H19a1,1,0,0,0,0,2h.93054A7.93083,7.93083,0,0,1,19.41022,15.00208Z"
							/></svg
						>
						<div class="text-sm">Dashboard</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/analitycs"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('" class="')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6"
							><path
								fill="currentColor"
								d="M5,12a1,1,0,0,0-1,1v8a1,1,0,0,0,2,0V13A1,1,0,0,0,5,12ZM10,2A1,1,0,0,0,9,3V21a1,1,0,0,0,2,0V3A1,1,0,0,0,10,2ZM20,16a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V17A1,1,0,0,0,20,16ZM15,8a1,1,0,0,0-1,1V21a1,1,0,0,0,2,0V9A1,1,0,0,0,15,8Z"
							/></svg
						>
						<div class="text-sm">Analitycs</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/business"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/business')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
					>
						<svg
							class="w-6 h-6 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/></svg
						>
						<div class="text-sm">Business</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/server"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/server')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
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
								d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
							/></svg
						>
						<div class="text-sm">Server</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/model"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/model')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
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
								d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
							/></svg
						>
						<div class="text-sm">Model</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/chat"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/chat')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
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
								d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
							/></svg
						>
						<div class="text-sm">Chat</div>
					</a>
				</li>
				<li>
					<a
						href="/admin/account"
						class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/account')
							? 'bg-primary'
							: 'hover:bg-base-300'}"
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
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/></svg
						>
						<div class="text-sm">Account</div>
					</a>
				</li>
			</ul>
			<!-- <hr class="h-[1px] border-0 bg-white/10" /> -->
			<!-- <section class="grid gap-2">
			<div class="px-6 font-bold text-xs text-white/60">Models</div>
			<ul class="grid gap-2 px-4">
				{#each user as item}
					<li class="grid gap-2">
						<button
							on:click={() => {
								item.active = !item.active;
							}}
							class="btn btn-xs btn-ghost w-full h-auto flex items-center justify-start px-3 py-2 gap-4 capitalize border-none rounded-md {item.model.some(
								(option) => option.link == path
							)
								? 'bg-primary'
								: 'hover:bg-base-300'}"
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
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
								/></svg
							>
							<div class="text-sm">{item.name}</div>
							<div class="flex-auto" />
							<svg
								class="w-4 h-4 transition-transform {item.active ? 'rotate-90' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</button>
						{#if item.active}
							<ul transition:slide class="grid gap-2 px-4">
								{#each item.model as model}
									<li>
										<a
											href={{base}model.link}
											class="flex items-center gap-4 px-3 py-2 rounded-md {model.link == path
												? 'bg-primary'
												: 'hover:bg-base-300'}"
										>
											<div>{model.name}</div>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</section> -->
			<hr class="h-[1px] border-0 bg-white/10" />
			<section class="grid gap-2">
				<ul class="grid gap-2 px-4">
					<li>
						<a
							href="/admin/setting"
							class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/setting')
								? 'bg-primary'
								: 'hover:bg-base-300'}"
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
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								/></svg
							>
							<div class="text-sm">Setting</div>
						</a>
					</li>
					<li>
						<a
							href="/admin/logout"
							class="flex items-center gap-4 px-3 py-2 rounded-md {path.endsWith('/logout')
								? 'bg-primary'
								: 'hover:bg-base-300'}"
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
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/></svg
							>
							<div class="text-sm">Logout</div>
						</a>
					</li>
				</ul>
			</section>
		</nav>
	</aside>
{/if}

<style lang="scss">
	.side {
		position: sticky;
		top: 0;
		height: 100vh;
		padding-bottom: 16px;
		display: grid;
		gap: 8px;
		align-content: start;
		overflow-y: auto;
	}
</style>
