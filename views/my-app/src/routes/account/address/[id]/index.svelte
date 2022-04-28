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
	import {
		Map,
		GeolocateControl,
		NavigationControl,
		ScaleControl,
		Marker,
		askLocationPermission,
		getLocation,
		RequestLocationPermissionDialog,
		MAP_KEY,
		center,
		zoom,
		lat,
		lng,
		menuList,
		searching,
		typing,
		geolocating,
		moving,
		recenter,
		search,
		tracking,
	} from '$lib/map';
	import Snackbar from '$components/snackbar.svelte';
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
		mdiPencilOutline,
		mdiMapSearchOutline,
		mdiMapOutline,
	} from '@mdi/js';

	import { onMount, onDestroy, getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { Diff } from '$lib/helper';
	import * as rules from '$lib/rules';

	import type { Item, MapComponent } from '$lib/map';
	import type { BuyerClient } from '../../../__layout.svelte';

	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	import { page } from '$app/stores';

	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let address: BuyerClient.Address;
	let copy: BuyerClient.Address;
	let disableSubmit = true;
	let snackbar: Snackbar;

	$: {
		if (address) {
			const change = Diff.object(copy, address);
			if (change) {
				disableSubmit = false;
			} else {
				disableSubmit = true;
			}
		}
	}

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			const result = await buyer.api.address.search({
				where: {id: +$page.params.id},
				rejectOnNotFound: true,
			});
			address = result;
			copy = Diff.objectCopy(result);
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
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
	async function submit() {
		try {
			loading();
			disableSubmit = false;
			const change = Diff.object(copy, address);
			if (!change) {
				throw new Error('Tidak ada perubahan');
			}
			await buyer.api.address.update({
				where: { id: address.id },
				data: change,
			});
			snackbar.setText('Berhasil');
			setTimeout(() => {
				goto('/account', {replaceState: true});
			}, 1500);
		} catch (error: any) {
			snackbar.setText(error.message);
			console.error(error);
			disableSubmit = true;
		} finally {
			snackbar.show();
			loaded();
		}
	}
</script>

<svelte:head>
	<title>Ubah Alamat</title>
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
			<span slot="title">Ubah Alamat</span>
		</AppBar>
		<main class="main">
			{#if user && address}
				<form id="address" class="wrapper" on:submit|preventDefault="{submit}">
					<TextField
						bind:value="{address.name}"
						outlined
						placeholder="-"
						type="text"
						rules="{rules.name}"
						autocomplete="name"
						required>Nama</TextField>
					<TextField
						bind:value="{address.telp}"
						outlined
						placeholder="-"
						type="tel"
						rules="{rules.telp}"
						autocomplete="tel"
						required>
						Nomor Handphone
					</TextField>
					<Textarea
						bind:value="{address.value}"
						autogrow
						outlined
						rows="{3}"
						placeholder="-"
						readonly
						required>
						<div>Alamat</div>
						<div slot="append">
							<Button
								fab
								icon
								text
								size="small"
								on:click="{() => {
									loading();
									sessionStorage.setItem('address', JSON.stringify(address));
									goto(location.href + '/pin');
								}}">
								<Icon class="grey-text text-darken-3" path="{mdiMapOutline}" />
							</Button>
						</div>
					</Textarea>
					<Textarea bind:value="{address.detail}" autogrow rows="{1}" outlined
						>Detail</Textarea>
				</form>
			{:else}
				<div class="wrapper">
					<input type="text" class="loading" />
					<input type="text" class="loading" />
					<input type="text" class="loading" />
					<input type="text" class="loading" />
				</div>
			{/if}
		</main>
		<Footer class="white elevation-5">
			<section class="btn">
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					form="address"
					type="submit"
					disabled="{disableSubmit}">Perbarui</Button>
			</section>
		</Footer>
		<Snackbar bind:this="{snackbar}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../../../components/common';
	@import '../../../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.main {
		padding: 16px 0;
		display: grid;
		align-content: start;
		row-gap: 16px;
		@include main;
	}
	.wrapper {
		padding: 16px;
		display: grid;
		row-gap: 16px;
	}
	input {
		min-height: 44px;
	}
	.list {
		display: grid;
		row-gap: 16px;
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
