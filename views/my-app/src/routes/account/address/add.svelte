<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		AppBar,
		Footer,
		Button,
		Icon,
		TextField,
		Textarea,
	} from 'svelte-materialify/src';
	import Snackbar from '$components/snackbar.svelte';
	import {
		mdiChevronLeft,
	} from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import * as rules from '$lib/rules';

	import type { Item, MapComponent } from '$lib/map';
	import type { BuyerClient } from '../../__layout.svelte';

	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let name = '';
	let telp = '';
	let detail = '';
	let myAddress = '';
	let disableSubmit = true;
	let snackbar: Snackbar;

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			if (user.name) {
				name = user.name;
			}
			if (user.telp) {
				telp = user.telp;
			}
			const data = history.state as { detail: string; position: Item };
			if (data) {
				myAddress = data.position.value;
				detail = data.detail;
				disableSubmit = false;
			}
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
	async function submit() {
		try {
			loading();
			const data = history.state as { detail: string; position: Item };
			if (data.position) {
				await buyer.address.add({
					label: '',
					pinned: true,
					selected: false,
					name,
					telp,
					detail,
					value: data.position.value,
					area: data.position.area,
					local: data.position.local,
					place: data.position.place,
					position: data.position.center,
					buyerId: user?.id,
				});
				snackbar.setText('Berhasil');
				setTimeout(() => {
					goto('/account/address', { replaceState: true, state: null });
				}, 1500);
			} else {
				throw new Error('Posisi tidak ditemukan');
			}
		} catch (error: any) {
			snackbar.setText(error.message);
			console.error(error);
		} finally {
			snackbar.show();
			loaded();
		}
	}
</script>

<svelte:head>
	<title>Tambah Alamat</title>
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
			<span slot="title">Tambah Alamat</span>
		</AppBar>
		<main class="main">
			{#if user}
				<form id="address" class="wrapper" on:submit|preventDefault="{submit}">
					<TextField
						bind:value="{name}"
						outlined
						placeholder="-"
						type="text"
						rules={rules.name}
						autocomplete="name"
						required>Nama</TextField>
					<TextField
						bind:value="{telp}"
						outlined
						placeholder="-"
						type="tel"
						rules={rules.telp}
						autocomplete="tel"
						required>
						Nomor Handphone
					</TextField>
					<Textarea
						bind:value="{myAddress}"
						autogrow
						outlined
						rows="{3}"
						placeholder="-"
						autocomplete="address-level1 address-level2 address-level3 address-level4"
						readonly
						required>
						Alamat
					</Textarea>
					<Textarea bind:value="{detail}" autogrow rows="{1}" outlined
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
					disabled="{disableSubmit}">Tambah</Button>
			</section>
		</Footer>
		<Snackbar bind:this="{snackbar}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../../components/common';
	@import '../../../components/skeleton';
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
