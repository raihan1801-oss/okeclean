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
		address,
		menuList,
		geolocating,
		moving,
		recenter,
		tracking,
		centre,
	} from '$lib/map';
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
		mdiMapSearchOutline,
		mdiCrosshairsGps,
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
	import type { ObserverUnsafe } from '$lib/helper';

	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let data: BuyerClient.Address;
	let disableSubmit = true;
	let isTracking = false;
	let map: MapComponent;
	let requestLocationPermissionDialog: RequestLocationPermissionDialog;

	$: {
		if (data) {
			disableSubmit = false;
		} else {
			disableSubmit = true;
		}
	}
	$: map?.resize();

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			data = JSON.parse(sessionStorage.getItem('address') ?? 'null');
			if (!data) {
				throw new Error('Alamat tidak terjangkau');
			}

			const item: Item | null = JSON.parse(
				sessionStorage.getItem('map') ?? 'null'
			);

			if (item) {
				data.area = item.area;
				data.local = item.local;
				data.place = item.place;
				data.position = item.center;
				data.value = item.value;
				sessionStorage.removeItem('map');
			}

			address.set(data.value);
			menuList.set([
				{
					area: data.area as any,
					local: data.local as any,
					place: data.place as any,
					center: data.position as any,
					name: '',
					value: data.value,
				},
			]);
			tracking.subscribe(updateTracking);
			address.subscribe(updateAddress);
			centre.subscribe(updatePosition);

			setTimeout(() => {
				map.flyTo({
					center: data.position as any,
					zoom: 16,
				});
			}, 1000);
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
	async function release() {
		tracking.unsubscribe(updateTracking);
		address.unsubscribe(updateAddress);
		centre.unsubscribe(updatePosition);
	}
	function loading() {
		$showProgress = true;
	}
	function loaded() {
		$showProgress = false;
	}
	function updateAddress(value: string) {
		if (data) {
			data.value = value;
		}
	}
	function updatePosition(coord: [number, number]) {
		data.position = coord;
	}
	function updateTracking(value: boolean) {
		isTracking = value;
		if (isTracking) {
			loading();
		} else {
			loaded();
		}
	}
	async function getPosition() {
		const permission = await askLocationPermission();

		if (permission != 'granted') {
			requestLocationPermissionDialog.active.set(true);
		}
	}
	function backSearch() {
		loading();
		goto(`/account/address/${data.id}/search`);
	}
	async function submit() {
		try {
			loading();
			await buyer.api.address.update({
				where: { id: data.id },
				data: {
					area: data.area,
					local: data.local,
					place: data.place,
					value: data.value,
					position: centre.get(),
				},
			});
			await goto('/account/address/' + data.id, { replaceState: true });
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
</script>

<svelte:head>
	<title>Tandai</title>
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
			<span slot="title">Tandai</span>
			<span class="space"></span>
			<Button text fab size="small" depressed on:click="{getPosition}">
				<Icon path="{mdiCrosshairsGps}" />
			</Button>
			<Button text fab size="small" depressed on:click="{backSearch}">
				<Icon path="{mdiMapSearchOutline}" />
			</Button>
		</AppBar>
		<main class="main">
			<form id="pin" on:submit|preventDefault="{submit}">
				{#if data}
					<div class="map">
						<div class="pin">
							<Icon path="{mdiMapMarker}" size="{48}" class="primary-text" />
						</div>
						<Map
							accessToken="{MAP_KEY}"
							style="mapbox://styles/mapbox/streets-v11"
							bind:this="{map}"
							zoom="{zoom}"
							center="{center}"
							on:drag="{moving}"
							on:recentre="{recenter}">
							<NavigationControl />
							<GeolocateControl on:geolocate="{geolocating}" />
							<ScaleControl />
						</Map>
					</div>
					<div class="field">
						<Textarea value="{data.value}" autogrow rows="{3}" outlined readonly
							>Alamat</Textarea>
					</div>
				{:else}
					<div class="map loading">&nbsp;</div>
					<div class="field">
						<input type="text" class="loading" />
					</div>
				{/if}
			</form>
		</main>
		<Footer class="white elevation-5">
			<section class="btn">
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					form="pin"
					type="submit"
					disabled="{disableSubmit}">Perbarui</Button>
			</section>
		</Footer>
		{#if user}
			<RequestLocationPermissionDialog
				bind:this="{requestLocationPermissionDialog}" />
		{/if}
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
	form {
		display: grid;
		row-gap: 16px;
		grid-template-rows: 3fr 1fr;
	}
	input {
		min-height: 44px;
	}
	.field {
		padding: 16px;
		display: grid;
		row-gap: 16px;
	}
	.space {
		flex: 1 1 auto;
	}
	.map {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		z-index: 0;
	}
	.pin {
		position: absolute;
		transform: translate(0px, -22.5px);
		z-index: 5;
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
