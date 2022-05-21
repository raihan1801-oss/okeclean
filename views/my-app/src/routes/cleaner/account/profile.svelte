<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		AppBar,
		Button,
		Icon,
		List,
		ListItem,
		Card,
		TextField,
		Dialog,
	} from "svelte-materialify/src";
	import {
		mdiChevronLeft,
		mdiImagePlus,
		mdiCameraOutline,
		mdiImageOutline,
	} from "@mdi/js";

	import { onMount, onDestroy, getContext } from "svelte";
	import { derived, writable } from "svelte/store";
	import { fade, slide } from "svelte/transition";
	import {
		wait,
		Diff,
		unsafeDuplicate,
		element_support,
		ProcessManagementUnsafe
	} from '$lib/helper';
	import * as rules from "$lib/rules";

	import type { BuyerClient } from "../../__layout.svelte";

	const showProgress = writable(true);
	const progress = writable(0);
	const indeterminate = writable(true);
</script>

<script lang="ts">
	const client = getContext<BuyerClient>("buyer");
	const proccess = new ProcessManagementUnsafe();
	// let profile = writable(buyer.get());
	let user_login: BuyerClient.User;
	let cached = {};
	let show_pick_image = false;
	let support_image_capture = false;
	let imageUrl = "";
	let image: File | undefined;
	let isSubmitDisable = true;
	$: diff(user_login);
	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user_login = await client.api.cleaner.auth();
			// if (!user_login) {
			// 	await buyer.ready;
			// 	user_login = await buyer.auth();
			// 	buyer.set(user_login);
			// }
			cached = unsafeDuplicate(user_login);
			// user_login.subscribe((value) => {
			// 	const changed = Diff.object(cached, value);
			// 	if (changed) {
			// 		isSubmitDisable = false;
			// 	} else {
			// 		isSubmitDisable = true;
			// 	}
			// });
			imageUrl = user_login.image ?? "";
			support_image_capture = element_support("input", "capture");
		} catch (error: any) {
		} finally {
			loaded();
		}
	}
	async function release() {}
	async function diff(tag: any) {
		if (user_login) {
			const changed = Diff.object(cached, user_login);
			if (changed) {
				isSubmitDisable = false;
			} else {
				isSubmitDisable = true;
			}
		}
	}
	async function save() {
		try {
			loading();
			isSubmitDisable = true;
			if (!user_login) return;
			proccess.start();
			await proccess.sleeped;
			const changed = Diff.object(cached, user_login);
			if (changed) {
				client.api.user.update({
					where: {
						id: user_login.id
					},
					data: changed
				});
				Object.assign(cached, changed);
			}
			proccess.finish();
		} catch (error: any) {
			console.error(error);
		} finally {
			loaded();
		}
	}
	function loading() {
		$showProgress = true;
	}
	function loaded() {
		$showProgress = false;
	}
	function inputFile(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const file = event.currentTarget.files?.[0];
		if (file && user_login) {
			show_pick_image = false;
			image = file;
			user_login.image = file.name;
			user_login = user_login;
			imageUrl = URL.createObjectURL(file);
			proccess.queue({ user_login, image }, async ({ user_login, image }) => {
				user_login.image = await client.api.user.uploadImage(
					`${user_login.id}/${image.name}`,
					image
				);
				user_login = user_login;
			});
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
			bind:active={$showProgress}
			bind:indeterminate={$indeterminate}
			bind:value={$progress}
			height="4px"
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<AppBar class="primary-color {$showProgress ? 'top-4' : ''}">
			<span slot="icon">
				<Button fab icon text size="small" on:click={() => history.back()}>
					<Icon path={mdiChevronLeft} />
				</Button>
			</span>
			<span slot="title">Profil</span>
		</AppBar>
		<main>
			{#if user_login}
				<form id="profile" on:submit|preventDefault={save}>
					<Card tile>
						<div class="thumb-wrapper">
							{#if imageUrl}
								<img class="thumb" src={imageUrl} alt="" />
							{:else}
								<Icon size={56} path={mdiImagePlus} />
							{/if}
							<button
								type="button"
								on:click={() => (show_pick_image = !show_pick_image)}
							/>
						</div>
					</Card>
					<br />
					<TextField
						class="textfield"
						value={user_login.name}
						autocomplete="username"
						outlined
						readonly>Name</TextField
					>
					<TextField
						class="textfield"
						bind:value={user_login.email}
						type="email"
						autocomplete="email"
						outlined
						rules={rules.email}>Email</TextField
					>
					<!-- <TextField
						class="textfield"
						bind:value={user_login.name}
						autocomplete="name"
						placeholder="-"
						rules={rules.name}
						outlined>Nama</TextField
					> -->
					<TextField
						class="textfield"
						bind:value={user_login.telp}
						type="tel"
						autocomplete="tel"
						placeholder="-"
						rules={rules.telp}
						outlined>Nomor Handphone</TextField
					>
					<TextField
						class="textfield"
						value={user_login.address?.name ?? "----"}
						placeholder="-"
						readonly
						outlined>Alamat</TextField
					>
				</form>
			{:else}
				<section class="data">
					<Card tile>
						<section class="wrapper-image">
							<div class="image loading" />
						</section>
					</Card>
					<br />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
					<div class="textfield loading" />
				</section>
			{/if}
			<br />
			<section class="btn">
				<Button
					class={isSubmitDisable ? "" : "primary-color"}
					type="submit"
					form="profile"
					disabled={isSubmitDisable}>Simpan</Button
				>
			</section>
		</main>
		<Dialog bind:active={show_pick_image}>
			<List>
				<ListItem>
					<div>Pilih Gambar</div>
					<div slot="prepend">
						<Icon path={mdiImageOutline} />
					</div>
					<input
						class="input-file"
						type="file"
						accept="image/*"
						on:input={inputFile}
					/>
				</ListItem>
				{#if support_image_capture}
					<ListItem>
						<div>Ambil Foto</div>
						<div slot="prepend">
							<Icon path={mdiCameraOutline} />
						</div>
						<input
							class="input-file"
							type="file"
							accept="image/*"
							capture
							on:input={inputFile}
						/>
					</ListItem>
				{/if}
			</List>
		</Dialog>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import "../../../components/common";
	@import "../../../components/skeleton";
	.loading {
		@include loading-sekeleton;
	}
	main {
		padding: 16px 0;
		display: grid;
		align-content: start;
		@include main;
	}
	.thumb-wrapper {
		padding: 16px;
		position: relative;
		display: grid;
		place-items: center;
		min-height: 150px;
		button {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
			z-index: 1;
		}
	}
	.input-file {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
	.thumb {
		margin: auto;
		height: 150px;
		width: env(height);
		object-fit: cover;
		object-position: center;
		aspect-ratio: 1/1;
	}
	.wrapper-image {
		padding: 16px;
		display: grid;
		place-items: center;
	}
	.image {
		width: 150px;
		object-fit: contain;
		object-position: center;
		aspect-ratio: 1;
	}
	.data,
	form {
		display: grid;
		row-gap: 16px;
	}
	.textfield {
		height: 48px;
		padding: 0 16px;
	}
	.btn {
		display: grid;
		padding: 0 16px;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		@include common-footer;
		.textfield {
			padding: 0 16px;
		}
	}
</style>
