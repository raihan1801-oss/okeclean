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
		Chip,
		TextField,
		Textarea,
		Checkbox,
	} from 'svelte-materialify/src';
	import { address, menuList, searching, typing } from '$lib/map';
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
		mdiMapMarkerAlertOutline,
		mdiMagnify,
		mdiClose,
		mdiMapMarker,
		mdiCrosshairsGps,
		mdiMapOutline,
	} from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';

	import type { Item, MapComponent } from '$lib/map';
	import type { BuyerClient } from '../../../__layout.svelte';

	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let data: BuyerClient.Address;
	let myAddress = '';
	let isSearching = false;
	let addressList: Item[] = [];
	let disableSubmit = true;

	$: {
		if (myAddress) {
			typing(myAddress);
		} else {
			disableSubmit = true;
		}
	}

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			address.subscribe(updateMyAddress);
			menuList.subscribe(updateMenu);
			searching.subscribe(updateSearching);
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			data = JSON.parse(sessionStorage.getItem('address') ?? 'null');
			if (!data) {
				throw new Error('Alamat tidak terjangkau');
			}
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
	async function release() {
		address.unsubscribe(updateMyAddress);
		menuList.unsubscribe(updateMenu);
		searching.unsubscribe(updateSearching);
	}
	function loading() {
		$showProgress = true;
	}
	function loaded() {
		$showProgress = false;
	}
	function select() {
		disableSubmit = false;
	}
	function updateMyAddress(value: string) {
		myAddress = value;
	}
	function updateSearching(value: boolean) {
		isSearching = value;
	}
	function updateMenu(value: Item[]) {
		addressList = value;
	}
	function submit() {
		try {
			loading();
			const location = menuList.get().find((item) => item.value == myAddress);
			if (location) {
				sessionStorage.setItem('map', JSON.stringify(location));
				goto(`/account/address/${data.id}/pin`);
			}
		} catch (error: any) {}
	}
	function openMap() {
		loading();
		goto(`/account/address/${data.id}/pin`);
	}
</script>

<svelte:head>
	<title>Cari</title>
	<meta name="" content="" />
</svelte:head>

<div transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:active="{$showProgress}"
			bind:indeterminate="{$indeterminate}"
			bind:value="{$progress}"
			height="4px"
			backgroundColor="secondary-color"
			color="secondary-color" />
		<AppBar class="primary-color {$showProgress ? 'top-4' : ''}">
			<span slot="icon">
				<Button fab icon text size="small" on:click="{() => history.back()}">
					<Icon path="{mdiChevronLeft}" />
				</Button>
			</span>
			<span slot="title">Cari</span>
			<span class="space"></span>
			<Button text fab size="small" depressed on:click="{openMap}">
				<Icon path="{mdiMapOutline}" />
			</Button>
		</AppBar>
		<main>
			<form id="search" on:submit|preventDefault="{submit}">
				{#if user}
					<TextField bind:value="{myAddress}" outlined>
						<div slot="prepend">
							<Icon path="{mdiMagnify}" />
						</div>
						<div>Alamat</div>
						<div slot="append">
							{#if myAddress}
								<Button
									fab
									icon
									text
									size="small"
									on:click="{() => {
										myAddress = '';
									}}">
									<Icon path="{mdiClose}" />
								</Button>
							{/if}
						</div>
					</TextField>
					<List>
						<ListItemGroup bind:value="{myAddress}">
							{#if isSearching}
								<div class="list">
									{#each Array(4) as value}
										<input type="text" readonly class="loading" />
									{/each}
								</div>
							{:else}
								{#each addressList as item}
									<ListItem
										value="{item.value}"
										active="{item.value == myAddress}"
										multiline
										on:click="{select}">
										{item.name}
										<span slot="subtitle">{item.value}</span>
									</ListItem>
								{/each}
							{/if}
						</ListItemGroup>
					</List>
				{:else}
					<input type="text" class="loading" />
				{/if}
			</form>
		</main>
		<Footer class="white elevation-5">
			<section class="btn">
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					form="search"
					type="submit"
					disabled="{disableSubmit}">Tandai</Button>
			</section>
		</Footer>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../../../components/common';
	@import '../../../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	main {
		padding: 32px 16px;
		display: grid;
		align-content: start;
		row-gap: 16px;
		@include main;
	}
	form {
		display: grid;
		row-gap: 16px;
	}
	input {
		min-height: 48px;
	}
	.list {
		display: grid;
		row-gap: 16px;
	}
	.space {
		flex: 1 1 auto;
	}
	.btn {
		padding: 0 16px;
		width: stretch;
		display: grid;
		column-gap: 16px;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		@include common-footer;
	}
</style>
