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
		mdiDelete,
	} from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';

	import type { BuyerClient } from '../../__layout.svelte';

	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let viewed: BuyerClient.Address | undefined;
	let address: BuyerClient.Address[] = [];
	let snackbar: Snackbar;
	let disableSubmit = true;
	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			address = await buyer.address.getAll();
			if (address.length) {
				viewed = address.find((item) => item.selected == true);
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
	async function select() {
		try {
			loading();
			if (viewed) {
				await buyer.address.setSelected({ id: viewed.id, selected: true });
				snackbar.setText('Berhasil');
				await init();
			} else {
				throw new Error('Gagal');
			}
		} catch (error: any) {
			snackbar.setText(error.message);
		} finally {
			snackbar.show();
			loaded();
		}
	}
	async function del() {
		try {
			loading();
			if (!viewed) {
				throw new Error('Tidak ada alamat');
			}
			await buyer.api.address.delete({ where: { id: viewed.id } });
			snackbar.setText('Berhasil hapus');
			await init();
		} catch (error: any) {
			snackbar.setText(error.message);
		} finally {
			snackbar.show();
			loaded();
		}
	}
</script>

<svelte:head>
	<title>Profil</title>
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
			<span slot="title">Alamat Saya</span>
		</AppBar>
		<main class="main">
			{#if user}
				<Card tile>
					<form
						id="address"
						class="wrapper"
						on:submit|preventDefault="{select}">
						<div>
							<Chip label>
								{#if viewed?.selected == true}
									<span>Terpilih</span>
								{:else if viewed?.selected == false}
									<span>Pilihan</span>
								{:else}
									<span>-</span>
								{/if}
							</Chip>
						</div>
						<TextField value="{viewed?.name}" outlined readonly placeholder="-">
							Nama
						</TextField>
						<TextField value="{viewed?.telp}" outlined readonly placeholder="-">
							Nomor Handphone
						</TextField>
						<Textarea
							value="{viewed?.value}"
							autogrow
							outlined
							rows="{3}"
							readonly
							placeholder="-">
							Alamat
						</Textarea>
						<Textarea
							value="{viewed?.detail}"
							outlined
							rows="{1}"
							readonly
							placeholder="-">
							Detail
						</Textarea>
						<div class="btns">
							<Button
								outlined
								disabled="{viewed == undefined}"
								on:click="{() => {
									if (viewed) {
										loading();
										goto('/account/address/' + viewed.id);
									}
								}}">Ubah</Button>
							<Button
								icon
								text
								type="reset"
								disabled="{viewed == undefined}"
								on:click="{del}">
								<Icon path="{mdiDeleteOutline}" />
							</Button>
						</div>
					</form>
				</Card>
				<List class="list">
					{#each address as item, index}
						<Card>
							<ListItem
								active="{viewed == item}"
								activeClass="primary-text"
								multiline
								on:click="{() => {
									viewed = item;
									if (item.selected) {
										disableSubmit = true;
									} else {
										disableSubmit = false;
									}
								}}">
								<span>{item.name}</span>
								<span slot="subtitle">
									<div>{item.value}</div>
									<div>{item.detail}</div>
								</span>
							</ListItem>
						</Card>
					{/each}
				</List>
			{:else}
				<Card tile>
					<section class="wrapper">
						<div class="item loading">&nbsp;</div>
						<div class="item loading">&nbsp;</div>
						<div class="item loading">&nbsp;</div>
						<div class="item loading">&nbsp;</div>
						<div class="item loading">&nbsp;</div>
						<div class="item loading">&nbsp;</div>
					</section>
				</Card>
				<List class="list">
					<div class="item loading">&nbsp;</div>
					<div class="item loading">&nbsp;</div>
				</List>
			{/if}
		</main>
		<Footer class="white elevation-5">
			<section class="btn">
				<Button outlined on:click="{() => goto('/account/address/search')}"
					>Tambah</Button>
				<Button
					class="{disableSubmit ? '' : 'primary-color'}"
					form="address"
					type="submit"
					disabled="{disableSubmit}">Pilih</Button>
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
	.item {
		height: 48px;
	}
	.btns {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: auto min-content;
		column-gap: 16px;
	}
	.btn {
		padding: 0 16px;
		width: stretch;
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 16px;
	}
	* :global {
		@include common-app {
			background-color: #f7f7f7;
		}
		@include common-loader;
		@include common-appbar;
		@include common-footer;
		.list {
			padding: 16px;
			display: grid;
			row-gap: 16px;
		}
	}
</style>
