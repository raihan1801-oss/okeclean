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
	} from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import { browser, dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';
	import * as rules from '$lib/rules';

	import type { BuyerClient } from '../__layout.svelte';

	const showProgress = writable(true);
	const progress = writable(0);
	const indeterminate = writable(true);
	let snackbar: Snackbar;
</script>

<script lang="ts">
	const buyer = getContext<BuyerClient>('buyer');
	let user = buyer.get();
	let isButtonDisable = false;
	let username = '';
	let password = '';
	let newPassword = '';
	let confirmPassword = '';
	let showPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;
	let passwordMessages: string[] = [];
	let newPasswordMessages: string[] = [];
	let confirmPasswordMessages: string[] = [];

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			if (!user) {
				await buyer.ready;
				user = await buyer.auth();
				buyer.set(user);
			}
			username = user.username;
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
			passwordMessages = newPasswordMessages = confirmPasswordMessages = [];
			if (newPassword == password) {
				newPasswordMessages = ['Gagal password lama dan baru sama'];
				return;
			}
			if (newPassword != confirmPassword) {
				confirmPasswordMessages = ['Gagal password tidak sama'];
				return;
			}
			isButtonDisable = true;
			await buyer.changePassword({
				username,
				password,
				newPassword,
				confirmPassword,
			});
			snackbar.setText('Berhasil Perbarui');
			snackbar.show();
		} catch (error: any) {
			if (error?.args?.newPassword) {
				newPasswordMessages = [error.message];
			} else if (error?.args?.confirmPassword) {
				confirmPasswordMessages = [error.message];
			} else if (error?.args?.password) {
				passwordMessages = [error.message];
			} else {
				snackbar.setText(error.message);
				snackbar.show();
			}
			isButtonDisable = false;
		} finally {
			loaded();
		}
	}
</script>

<svelte:head>
	<title>Ubah Password</title>
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
			<span slot="title">Ubah Password</span>
		</AppBar>
		<main class="main">
			{#if user}
				<Card tile>
					<form
						id="change-password"
						class="wrapper"
						on:submit|preventDefault="{submit}">
						<TextField
							class="textfield"
							value="{username}"
							autocomplete="username"
							outlined
							style="display: none;"
							readonly>Username</TextField>
						<TextField
							class="textfield"
							bind:value="{password}"
							autocomplete="current-password"
							rules="{rules.password}"
							type="{showPassword ? 'text' : 'password'}"
							messages="{passwordMessages}"
							outlined
							required
							><div>Password saat ini</div>
							<div slot="append">
								<Button
									fab
									icon
									text
									size="small"
									on:click="{() => {
										showPassword = !showPassword;
									}}">
									<Icon
										class="grey-text text-darken-3"
										path="{showPassword ? mdiEyeOff : mdiEye}" />
								</Button>
							</div></TextField>
						<TextField
							class="textfield"
							bind:value="{newPassword}"
							autocomplete="new-password"
							rules="{rules.password}"
							type="{showNewPassword ? 'text' : 'password'}"
							messages="{newPasswordMessages}"
							outlined
							required
							><div>Password Baru</div>
							<div slot="append">
								<Button
									fab
									icon
									text
									size="small"
									on:click="{() => {
										showNewPassword = !showNewPassword;
									}}">
									<Icon
										class="grey-text text-darken-3"
										path="{showNewPassword ? mdiEyeOff : mdiEye}" />
								</Button>
							</div></TextField>
						<TextField
							class="textfield"
							bind:value="{confirmPassword}"
							autocomplete="new-password"
							type="{showConfirmPassword ? 'text' : 'password'}"
							messages="{confirmPasswordMessages}"
							outlined
							required
							><div>Konfirmasi Password</div>
							<div slot="append">
								<Button
									fab
									icon
									text
									size="small"
									on:click="{() => {
										showConfirmPassword = !showConfirmPassword;
									}}">
									<Icon
										class="grey-text text-darken-3"
										path="{showConfirmPassword ? mdiEyeOff : mdiEye}" />
								</Button>
							</div></TextField>
					</form>
				</Card>
			{:else}
				<Card tile>
					<section class="wrapper">
						<div class="textfield loading">&nbsp;</div>
						<div class="textfield loading">&nbsp;</div>
						<div class="textfield loading">&nbsp;</div>
					</section>
				</Card>
			{/if}
		</main>
		<Footer class="footer white elevation-5">
			<section class="btn">
				<Button
					class="{isButtonDisable ? '' : 'primary-color'}"
					form="change-password"
					type="submit"
					disabled="{isButtonDisable}">Konfirmasi</Button>
			</section>
		</Footer>
		<Snackbar bind:this="{snackbar}" />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
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
	.textfield {
		height: 48px;
	}
	.footer {
		position: sticky;
		bottom: 0;
		width: stretch;
	}
	.btn {
		padding: 0 16px;
		width: stretch;
		display: grid;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		@include common-footer;
	}
</style>
