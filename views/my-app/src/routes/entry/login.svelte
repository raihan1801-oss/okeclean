<script context="module" lang="ts">
	import {
		MaterialAppMin,
		AppBar,
		Button,
		Icon,
		TextField,
		Select,
	} from "svelte-materialify/src";
	import ProgressLinear from "$components/progress-linear.svelte";
	import Alert from "$components/alert.svelte";
	import { mdiEye, mdiEyeOff, mdiChevronLeft } from "@mdi/js";

	import { onMount, onDestroy, getContext } from "svelte";

	import { fade } from "svelte/transition";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

	import type { Context, Roles } from "./__layout.svelte";
	import type { ObserverUnsafe } from "$lib/helper";
</script>

<script lang="ts">
	const user = getContext<Context>("layout");
	const roles = getContext<Roles>("roles");
	const is_desktop = getContext<ObserverUnsafe<boolean>>("is_desktop");
	let alert: Alert;
	let loader: ProgressLinear;
	let name = "";
	let password = "";
	let role = $page.url.searchParams.get("role") ?? "customer";
	let showPassword = false;
	let disableSubmit = false;

	onMount(init);
	onDestroy(release);

	function init() {
		loader.loaded();
	}
	function release() {}
	async function submit() {
		try {
			loader.loading();
			alert.hide();
			disableSubmit = true;
			if (role == "customer") {
				await user.user.login({
					name,
					password,
				});
				role = "";
			} else if (role == "cleaner") {
				await user.user.login({
					name,
					password,
				});
			} else {
				throw new Error("Unknown Role");
			}
			alert.setState("success");
			alert.setText("Berhasil Masuk");
			alert.show();

			goto("/" + role, { replaceState: true });
		} catch (error: any) {
			disableSubmit = false;

			alert.setState("error");
			alert.setText(error.message);
			alert.show();

			loader.loaded();
		}
	}
</script>

<svelte:head>
	<title>Masuk</title>
	<meta name="description" content="Masuk Akun" />
</svelte:head>

<div transition:fade class="white">
	<MaterialAppMin>
		<ProgressLinear bind:this={loader} />
		<AppBar class="transparent" flat>
			<span slot="icon">
				<Button fab icon text size="small" on:click={() => history.back()}>
					<Icon path={mdiChevronLeft} />
				</Button>
			</span>
		</AppBar>
		<main>
			{#if $is_desktop}
				<header transition:fade class="title">
					<img class="logo" src="logo.png" alt="ada ikan" height="64" />
					<span>Oke Clean</span>
				</header>
			{/if}
			<div class="spacer" />
			<form
				on:submit|preventDefault={submit}
				class={$is_desktop ? "card p-32" : ""}
			>
				<fieldset>
					<div class="title">
						{#if !$is_desktop}
							<img
								transition:fade
								class="logo"
								src="logo.png"
								alt="ada ikan"
								height="64"
							/>
							<span transition:fade>Masuk</span>
						{:else}
							<span class="f-18 f-500">Masuk</span>
						{/if}
					</div>
					<div class="w-full">
						<Alert bind:this={alert} />
					</div>
					<div class="content">
						<Select
							bind:value={role}
							items={roles}
							class="textfield"
							placeholder={$is_desktop ? "" : "Sebagai"}
							solo={!$is_desktop}
							outlined={$is_desktop}
							required
						>
							{#if $is_desktop}
								Sebagai
							{/if}
						</Select>
						<TextField
							bind:value={name}
							class="textfield"
							placeholder={$is_desktop ? "" : "Username"}
							solo={!$is_desktop}
							outlined={$is_desktop}
							autocomplete="username"
							required
						>
							{#if $is_desktop}
								Username
							{/if}
						</TextField>
						<div>
							<TextField
								class="textfield"
								bind:value={password}
								placeholder={$is_desktop ? "" : "Password"}
								solo={!$is_desktop}
								outlined={$is_desktop}
								type={showPassword ? "text" : "password"}
								autocomplete="current-password"
								required
							>
								<div>
									{#if $is_desktop}
										Password
									{/if}
								</div>
								<div slot="append">
									<Button
										fab
										icon
										text
										size="small"
										on:click={() => {
											showPassword = !showPassword;
										}}
									>
										<Icon
											class="grey-text text-darken-3"
											path={showPassword ? mdiEyeOff : mdiEye}
										/>
									</Button>
								</div>
							</TextField>
							<div class="t-end f-14">
								{#if role == "buyer"}
									<a
										transition:fade
										class={$is_desktop ? "black-text" : "white-text"}
										href="/entry/reset/step-1">Lupa Password?</a
									>
								{/if}
							</div>
						</div>
					</div>
					<div class="btns">
						<Button type="submit" size="large" disabled={disableSubmit}
							>Masuk</Button
						>
						<div class="t-center black-text">
							<div class="f-14 f-500">Belum Punya Akun?</div>
							<a
								class={$is_desktop ? "primary-text" : "white-text"}
								href="/entry/register"
							>
								Register
							</a>
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import "../../components/common";
	@import "../../components/elevation";
	.card {
		@include elevation;
		border-radius: 6px;
		background-color: white;
	}
	main {
		max-width: 100vw;
		min-height: 100vh;
		padding: 32px;
		display: grid;
	}
	form {
		margin: auto;
		width: 100%;
		height: 100%;
		position: relative;
		display: grid;
		place-items: center;
		row-gap: 32px;
		transition: all 250ms ease;
		@include medium-up {
			width: 420px;
		}
	}
	fieldset {
		display: contents;
	}
	.title {
		display: grid;
		place-items: center;
		gap: 8px;
		font-weight: 600;
	}
	.content {
		width: 100%;
		display: grid;
		row-gap: 16px;
	}
	.btns {
		width: 100%;
		display: grid;
		row-gap: 8px;
	}
	.t-center {
		text-align: center;
	}
	.t-end {
		text-align: end;
	}
	.f-18 {
		font-size: 18px;
	}
	.f-14 {
		font-size: 14px;
	}
	.f-500 {
		font-weight: 500;
	}
	.w-full {
		width: 100%;
	}
	.p-32 {
		padding: 32px;
	}
	.spacer {
		height: 44px;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		.textfield {
			@include input-default;
			.s-input__details {
				font-size: 13px;
				font-weight: 500;
			}
			.s-text-field__input label {
				overflow: visible;
			}
			.s-input input,
			.s-list-item__title {
				line-height: normal;
			}
		}
		.btns {
			@include btn-default;
			padding: 0 16px;
		}
		.hover {
			border: 2px solid transparent;
			&:hover {
				border: 2px solid black;
			}
		}
	}
</style>
