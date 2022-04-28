<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		AppBar,
		Footer,
		Button,
		Icon,
		Menu,
		NavigationDrawer,
		Avatar,
		List,
		ListGroup,
		ListItem,
		ListItemGroup,
		Card,
		TextField,
		Checkbox,
	} from 'svelte-materialify/src';
	import {
		mdiAccountOutline,
		mdiClipboardListOutline,
		mdiBellOutline,
		mdiTagOutline,
		mdiLogout,
		mdiAccountCircle,
		mdiMapMarkerRadiusOutline,
		mdiCheck,
		mdiEyeOff,
		mdiEye,
		mdiDeleteOutline,
		mdiChevronLeft,
		mdiChevronRight,
	} from '@mdi/js';

	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';
	import { Promiseify } from '$lib/helper';
	import UserStore from '$lib/token';
	import navigation from '$lib/detail-nav';

	const role = 'buyer';
	const userStore = new UserStore(role, { debug: dev });
	const api = {};
	let theme = writable<'light' | 'dark'>('light');
	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
	let ready = new Promiseify();
</script>

<script lang="ts">
	onMount(init);
	onDestroy(release);
	async function init() {
		ready.resolver(window);
		try {
			const info = await userStore.init().retrieve();
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
	async function release() {}
	function loading() {
		$showProgress = true;
	}
	function loaded() {
		$showProgress = false;
	}
</script>

<svelte:head>
	<title>Profil</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin theme="{$theme}">
		<ProgressLinear
			bind:active="{$showProgress}"
			bind:indeterminate="{$indeterminate}"
			bind:value="{$progress}"
			height="4px"
			backgroundColor="secondary-color"
			color="secondary-color" />
		<AppBar class="prmary-color {$showProgress ? 'top-4' : ''}">
			<span slot="icon">
				<Button fab icon text size="small" on:click="{() => history.back()}">
					<Icon path="{mdiChevronLeft}" />
				</Button>
			</span>
			<span slot="title">Di Proses</span>
		</AppBar>
		<main class="main">
			<List class="list">
				{#each Array(4) as item}
					<Card>
						<ListItem>
							<div class="item loading">&nbsp;</div>
						</ListItem>
					</Card>
				{/each}
			</List>
		</main>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 16px 16px;
		display: grid;
		align-content: start;
		row-gap: 16px;
	}
	.item {
		height: 80px;
	}
	.t-1 {
		font-size: 20px;
		font-weight: 500;
		line-height: normal;
		width: stretch;
	}
	.t-2 {
		font-size: 18px;
		font-weight: 500;
		line-height: normal;
		width: stretch;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		@include common-footer;
		.list {
			display: grid;
			row-gap: 16px;
		}
	}
</style>
