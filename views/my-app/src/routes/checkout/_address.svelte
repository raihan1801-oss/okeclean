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
		mdiPencilOffOutline,
		mdiMapSearchOutline,
		mdiCrosshairsGps,
	} from '@mdi/js';
	import * as Map from '$lib/map';
	import * as rules from '$lib/rules';
	import RequestLocationPermissionDialog from '$components/ask-location-dialog.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';

	import type { BuyerClient } from '../__layout.svelte';

	export { Map };
</script>

<script lang="ts">
	let name = '';
	let telp = '';
	let address = '';
	let position: Map.Item | undefined;
	let map: Map.MapComponent;
	let requestLocationPermissionDialog: RequestLocationPermissionDialog;
	let editName = false;
	let editTelp = false;
	let editMap = false;
	let first = true;
	let showMenu = false;

	export let data: BuyerClient.Address | null | undefined = undefined;
	export let menu: BuyerClient.Address[] = [];
	export let loader = false;
	// let loader = true;
	export let editAll = false;

	$: update(data);
	$: toggleEdit(editAll);

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			Map.tracking.subscribe(updateLoader);
			Map.address.subscribe(updateAddress);
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
	async function release() {
		Map.tracking?.unsubscribe(updateLoader);
		Map.address?.unsubscribe(updateAddress);
	}
	function loading() {
		loader = true;
	}
	function loaded() {
		loader = false;
	}
	function toggleEdit(value: boolean) {
		editName = value;
		editTelp = value;
		editMap = value;
	}
	function updateAddress(value: string) {
		const position = Map.getSelected();
		if (data && position) {
			data = {
				...data,
				area: position.area,
				local: position.local,
				place: position.place,
				value: position.value,
				position: [Map.lng.get(), Map.lat.get()],
			};
		}
	}
	function updateLoader(value: boolean) {
		if (value) {
			loading();
		} else {
			loaded();
		}
	}
	function update(tag: any) {
		if (first) {
			first = false;
			if (data) {
				toggleEdit(false);
				setTimeout(() => {
					flyTo(data?.position);
				}, 1000);
			} else if (data === null) {
				data = {
					id: 0,
					detail: '',
					label: '',
					name: '',
					value: '',
					telp: '',
					selected: false,
					pinned: false,
					position: Map.center,
					area: '',
					local: '',
					place: '',
					buyerId: 0,
				};
				askLocation();
			} else {
				first = true;
			}
		}
	}
	function prevent(event: Event) {}
	function flyTo(center: any) {
		map.flyTo({ center, zoom: 16 });
	}
	async function askLocation() {
		const permission = await Map.askLocationPermission();
		if (permission != 'granted') {
			requestLocationPermissionDialog.state.subscribe(async (value) => {
				if (value == 'granted') {
					try {
						const position = await Map.getLocation();
						const center: [number, number] = [
							position.coords.longitude,
							position.coords.latitude,
						];
						if (data) {
							data.position = center;
							data = data;
						}
						flyTo(center);
					} catch (error: any) {
						requestLocationPermissionDialog.active.set(false);
						requestLocationPermissionDialog.button.set(false);
						requestLocationPermissionDialog.text.set('Ijin tertolak');
						requestLocationPermissionDialog.active.set(true);
					}
				}
			});
			requestLocationPermissionDialog.active.set(true);
		}
	}
</script>

{#if browser && data}
	<!-- <TextField
		bind:value="{data.name}"
		readonly="{!editName}"
		rules="{rules.name}"
		type="text"
		autocomplete="name">
		<div>Nama</div>
		<div slot="append">
			<Button
				fab
				icon
				text
				size="small"
				on:click="{() => {
					editName = !editName;
				}}">
				<Icon
					class="grey-text text-darken-3"
					path="{editName ? mdiPencilOffOutline : mdiPencilOutline}" />
			</Button>
		</div>
	</TextField>
	<TextField
		bind:value="{data.telp}"
		readonly="{!editTelp}"
		rules="{rules.telp}"
		type="tel"
		autocomplete="tel">
		<div>Nomor Handphone</div>
		<div slot="append">
			<Button
				fab
				icon
				text
				size="small"
				on:click="{() => {
					editTelp = !editTelp;
				}}">
				<Icon
					class="grey-text text-darken-3"
					path="{editTelp ? mdiPencilOffOutline : mdiPencilOutline}" />
			</Button>
		</div>
	</TextField> -->
	<div class="map {editMap ? '' : 'disable-touch'} m-b-16">
		{#if editMap}
			<div class="pin">
				<Icon path="{mdiMapMarker}" size="{48}" class="primary-text" />
			</div>
		{:else}
			<div class="overlay">
				<Button class="btn" outlined on:click="{() => (editMap = !editMap)}"
					>Ubah</Button>
			</div>
		{/if}
		<Map.Map
			bind:this="{map}"
			accessToken="{Map.MAP_KEY}"
			style="mapbox://styles/mapbox/streets-v11"
			zoom="{Map.zoom}"
			center="{Map.center}"
			on:drag="{editMap ? Map.moving : prevent}"
			on:recentre="{editMap ? Map.recenter : prevent}">
			{#if !editMap}
				<Map.Marker
					label="{data.name}, {data.telp}{data.detail
						? `, ${data.detail}`
						: ''}"
					lng="{data.position[0]}"
					lat="{data.position[1]}" />
			{/if}
			<Map.NavigationControl />
			<Map.GeolocateControl
				on:geolocate="{editMap ? Map.geolocating : prevent}" />
			<Map.ScaleControl />
		</Map.Map>
	</div>
	<Menu offsetY bind:active="{showMenu}" closeOnClick>
		<span slot="activator">
			<Textarea
				bind:value="{data.value}"
				autogrow
				rows="{3}"
				readonly
				autocomplete="address-level1 address-level2 address-level3 address-level4">
				<div>Alamat</div>
			</Textarea>
		</span>
		<ListItemGroup value="{data.value}">
			{#each menu as item}
				<ListItem
					multiline
					value="{item.value}"
					active="{item.value == data.value}"
					on:click="{() => {
						data = item;
						flyTo(item.position);
					}}">
					<div>{item.name}</div>
					<div class="mult" slot="subtitle">
						<div>{item.telp}</div>
						<div>{item.value}</div>
					</div>
				</ListItem>
			{/each}
		</ListItemGroup>
	</Menu>
{:else}
	<div class="textfield loading">&nbsp;</div>
	<div class="textfield loading">&nbsp;</div>
	<div class="map loading">&nbsp;</div>
	<div class="textfield loading">&nbsp;</div>
{/if}

<RequestLocationPermissionDialog
	bind:this="{requestLocationPermissionDialog}" />

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	.loading {
		@include loading-sekeleton;
	}
	.map {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		aspect-ratio: 4/3;
		z-index: 0;
		@include medium-only {
			aspect-ratio: 4/2.5;
		}
		@include large-only {
			aspect-ratio: 4/2;
		}
		@include very-large-up {
			aspect-ratio: 4/1.5;
		}
	}
	.pin {
		position: absolute;
		transform: translate(0px, -22.5px);
		z-index: 5;
	}
	.overlay {
		position: absolute;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.129);
		z-index: 6;
		:global(.btn) {
			transform: translate(0, 48px);
		}
	}
	.disable-touch {
		touch-action: none;
	}
	.textfield {
		height: 48px;
	}
	.btn {
		padding: 0 16px;
		width: stretch;
		display: grid;
		column-gap: 16px;
	}
	.m-b-16 {
		margin-bottom: 16px;
	}
	.mult {
		margin-top: 4px;
		display: grid;
		row-gap: 4px;
	}
</style>
