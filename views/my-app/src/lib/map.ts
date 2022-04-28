// @ts-ignore
import { Map, Geocoder, Marker, controls } from '@beyonk/svelte-mapbox';
import RequestLocationPermissionDialog from '$components/ask-location-dialog.svelte';
// @ts-ignore
import mbxSdk from '@mapbox/mapbox-sdk';
import mbxGeocodingSdk from '@mapbox/mapbox-sdk/services/geocoding.js';
import mbxDirectionsSdk from '@mapbox/mapbox-sdk/services/directions.js';

import { wait, ObserverUnsafe } from '$lib/helper';
import { MAP_KEY } from '$lib/env';

export interface Result {
	center: [number, number];
	place_name: string;
}
export interface Center {
	lat: number;
	lng: number;
}
export interface Item {
	name: string;
	value: string;
	center: [number, number];
	area: string;
	local: string;
	place: string;
}
export type Waypoints = { coordinates: [number, number] }[];
export type Directions = {
	code: string;
	routes: {
		distance: number;
		duration: number;
	}[];
};
interface Props {
	style: string;
	accessToken: string;
	zoom: number;
	center: [number, number];
}
export interface MapComponent extends Svelte2TsxComponent<Props> {
	flyTo: (arg: { center: [number, number]; zoom: number }) => void;
	addControl(control: any, position: 'top-right' | string): void;
	fitBounds(bbox: number[], data: object): void;
	getMap(): unknown;
	getMapbox(): unknown;
	resize(): void;
	setCenter(coords: any, data: any): void;
	setZoom(value: any, data: any): void;
}

const { GeolocateControl, NavigationControl, ScaleControl } = controls;

export { MAP_KEY };
export const CONST = {
	lat: -1.42,
	lng: 119.44,
	zoom: 6,
	center: [119.969777, -4.880139],
};
export const lat = new ObserverUnsafe(CONST.lat, { debug: false });
export const lng = new ObserverUnsafe(CONST.lng, { debug: false });
export const address = new ObserverUnsafe('');
export const menuList = new ObserverUnsafe<Item[]>([]);
export const searching = new ObserverUnsafe(false);
export const tracking = new ObserverUnsafe(false);
export const centre = new ObserverUnsafe<[number, number]>([
	CONST.lng,
	CONST.lat,
]);
export const zoom = CONST.zoom;
export const center = CONST.center;
export const bbox: [number, number, number, number] = [
	119.300573, -5.750302, 120.563784, -3.568224,
];

const mbxClient = mbxSdk({ accessToken: MAP_KEY });
const mbxGeocoding = mbxGeocodingSdk(mbxClient);
export const mbxDirections = mbxDirectionsSdk(mbxClient);

export {
	Map,
	Marker,
	GeolocateControl,
	NavigationControl,
	ScaleControl,
	RequestLocationPermissionDialog,
};

export function getSelected() {
	const value = address.get();
	return menuList.get().find((menu) => menu.value == value);
}
export function typing(value: string) {
	wait({
		timeout: 250,
		delay: 1750,
		arg: value,
		callback: search,
	});
}
export function recenter(event: CustomEvent<{ center: Center }>) {
	const { center } = event.detail;

	if (center.lat == lat.get() && center.lng == lng.get()) {
		return;
	} else {
		lat.set(center.lat);
		lng.set(center.lng);
	}

	wait({
		timeout: 250,
		delay: 1250,
		arg: [center.lng, center.lat],
		callback: track,
	});
}
export function moving(event: CustomEvent) {
	address.set('');
}
export function geolocating(event: CustomEvent) {
	address.set('');
}
export async function search(value: string) {
	const item = menuList.get().find((item) => item.value == value);
	if (item) {
		return;
	}

	searching.set(true);

	const response = await mbxGeocoding
		.forwardGeocode({ autocomplete: true, bbox, query: value })
		.send();

	const { body } = response;
	const result: Item[] = [];

	if (body) {
		if (body.type == 'FeatureCollection') {
			for (const data of body.features) {
				result.push({
					name: data.text,
					value: data.place_name,
					center: data.center,
					area: data.context.at(0)?.text ?? '',
					local: data.context.at(2)?.text ?? '',
					place: data.context.at(3)?.text ?? '',
				});
			}
			menuList.set(result);
		}
	}
	searching.set(false);
}
export async function track([lng, lat]: [number, number]) {
	const value = address.get();
	if (menuList.get().some((item) => item.value == value)) {
		return;
	}

	tracking.set(true);

	const response = await mbxGeocoding
		.reverseGeocode({ query: [lng, lat], bbox })
		.send();

	const { body } = response;

	if (body) {
		if (body.type == 'FeatureCollection') {
			const data = body.features.at(0);
			if (data) {
				menuList.set([
					{
						name: data.text,
						value: data.place_name,
						center: data.center,
						area: data.context.at(0)?.text ?? '',
						local: data.context.at(2)?.text ?? '',
						place: data.context.at(3)?.text ?? '',
					},
				]);
				address.set(data.place_name ?? '');
			}
		}
	}
	tracking.set(false);
	centre.set([lng, lat]);
}

export function askLocationPermission() {
	return new Promise<PermissionState>(async function (resolve) {
		const permission = await navigator.permissions.query({
			name: 'geolocation',
		});
		resolve(permission.state);
	});
}
export function getLocation() {
	return new Promise<GeolocationPosition>((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(value) => {
				resolve(value);
			},
			(error) => {
				reject(error);
			}
		);
	});
}
