<script context="module" lang="ts">
	import { page } from '$app/stores';
</script>

<script lang="ts">
	import Drawer, { slide } from '$components/drawer.svelte';
	import Appbar from '$components/appbar.svelte';
	import List from '$components/list.svelte';
	import ListItem from '$components/list-item.svelte';
	import Item from '$components/item.svelte';

	let path = $page.url.pathname;
</script>

<Appbar class="px-8">
	<section class="w-full h-full relative flex items-center">
		<img src="/logo.png" alt="Logo" width="32" height="32" class="absolute" />
		<div class="block flex-auto text-center font-bold">Oke Clean</div>
	</section>
</Appbar>
<nav class="flex flex-col gap-4">
	<List class="gap-2 px-4">
		<ListItem>
			<a href="/admin/dashboard" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/dashboard') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/business" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/business') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/server" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/server') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/model" class="block">
				<Item class="p-3 rounded-md {path.endsWith('/model') ? 'bg-primary' : 'hover:bg-base-300'}">
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/chat" class="block">
				<Item class="p-3 rounded-md {path.endsWith('/chat') ? 'bg-primary' : 'hover:bg-base-300'}">
					<svg
						slot="start"
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
						/></svg
					>
					<div class="text-sm">Chat</div>
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/broadcast" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/broadcast') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
						class="w-6 h-6"
						xmlns="http://www.w3.org/2000/svg"
						data-name="Layer 1"
						viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="M19.99121,2.002a.99943.99943,0,0,0-1,1v.63672a9.03617,9.03617,0,0,1-7,3.36328h-6a3.00328,3.00328,0,0,0-3,3v2a3.00328,3.00328,0,0,0,3,3H6.475L4.07227,20.6084A.99931.99931,0,0,0,4.99121,22.002h4a.99857.99857,0,0,0,.91895-.60644L12.63391,15.04a9.02805,9.02805,0,0,1,6.3573,3.32507V19.002a1,1,0,0,0,2,0v-16A.99942.99942,0,0,0,19.99121,2.002Zm-14,11a1.00067,1.00067,0,0,1-1-1v-2a1.00068,1.00068,0,0,1,1-1h1v4Zm2.34082,7H6.50781l2.14258-5h1.82422ZM18.99121,15.5238a11.052,11.052,0,0,0-7-2.52185h-3v-4h3a11.05281,11.05281,0,0,0,7-2.52234Z"
						/></svg
					>
					<div class="text-sm">Broadcast</div>
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/folder" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/folder') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
						/></svg
					>
					<div class="text-sm">Folder</div>
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/account" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/account') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
	</List>
	<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
	<List class="gap-2 px-4">
		<ListItem>
			<a href="/admin/setting" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/setting') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
		<ListItem>
			<a href="/admin/logout" class="block">
				<Item
					class="p-3 rounded-md {path.endsWith('/logout') ? 'bg-primary' : 'hover:bg-base-300'}"
				>
					<svg
						slot="start"
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
				</Item>
			</a>
		</ListItem>
	</List>
</nav>
<div class="flex-grow" />
<div class="text-sm opacity-70 text-center">v0.alpha.1</div>
