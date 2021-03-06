<script context="module" lang="ts">
	import { MaterialAppMin, AppBar, Button, Icon, Select, TextField } from 'svelte-materialify/src';
	import ProgressLinear from '$components/progress-linear.svelte';
	import Alert from '$components/alert.svelte';
	import { mdiChevronLeft, mdiEye, mdiEyeOff } from '@mdi/js';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { wait } from '$lib/helper';

	import * as rules from '$lib/rules';

	import type { Context, Roles } from './__layout.svelte';
	import type { ObserverUnsafe } from '$lib/helper';
</script>

<script lang="ts">
	const user = getContext<Context>('layout');
	const roles = getContext<Roles>('roles');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	let alert: Alert;
	let loader: ProgressLinear;
	let email = '';
	let name = '';
	let password = '';
	let role = 'customer';
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

			if (role == 'customer') {
				await user.customer.register({
					email,
					name,
					password,
					role
				});
			} else if (role == 'cleaner') {
				await user.cleaner.register({
					email,
					name,
					password,
					role
				});
			} else {
				throw new Error('Unknown Role');
			}

			alert.setState('success');
			alert.setText('Berhasil mendaftar');
			alert.show();

			await wait({ timeout: 1000 });

			if (role == 'customer') {
				goto('/entry/verify', { replaceState: true });
			} else {
				goto('/cleaner', { replaceState: true });
			}
		} catch (error: any) {
			alert.setState('error');
			alert.setText(error.message);
			alert.show();

			disableSubmit = false;

			loader.loaded();
		}
	}
</script>

<svelte:head>
	<title>Mendaftar</title>
	<meta name="description" content="Mendaftar Akun" />
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
					<img class="logo" src="/logo.png" alt="oke clean" height="64" />
					<span>Oke Clean</span>
				</header>
			{/if}
			<div class="spacer" />
			<form
				autocomplete="on"
				on:submit|preventDefault={submit}
				class={$is_desktop ? 'card p-32' : ''}
			>
				<fieldset>
					<div class="title">
						{#if !$is_desktop}
							<img transition:fade class="logo" src="/logo.png" alt="oke clean" height="64" />
							<span transition:fade>Mendaftar</span>
						{:else}
							<span class="f-18 f-500">Mendaftar</span>
						{/if}
					</div>
					<div class="w-full">
						<Alert bind:this={alert} />
					</div>
					<div class="content">
						<div class="text-set">
							<Select bind:value={role} items={roles} class="textfield" outlined required>
								Sebagai
							</Select>
							<TextField
								class="textfield"
								bind:value={email}
								outlined
								rules={rules.email}
								autocomplete="email"
								type="email"
								required
							>
								Email
							</TextField>
						</div>
						<div class="text-set">
							<TextField
								class="textfield"
								bind:value={name}
								outlined
								rules={rules.username}
								autocomplete="username"
								required
							>
								Username
							</TextField>
						</div>
						<div class="text-set">
							<TextField
								class="textfield"
								bind:value={password}
								outlined
								rules={rules.password}
								type={showPassword ? 'text' : 'password'}
								autocomplete="new-password"
								required
							>
								<div>Password</div>
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
						</div>
						<div class="skb">
							<p>Saya menyetujui syarat dan ketentuan berlaku dengan mendaftar</p>
							<p><a href="?">Lihat syarat dan ketentuan</a></p>
						</div>
					</div>
					<div class="btns">
						<Button class="btn" type="submit" size="large" disabled={disableSubmit}>Daftar</Button>
						<div class="t-center black-text">
							<div class="f-14 f-500">Punya Akun?</div>
							<a class={$is_desktop ? 'primary-text' : 'white-text'} href="/entry/login">
								Log in
							</a>
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/elevation';
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
		row-gap: 8px;
	}
	.text-set {
		width: 100%;
		display: grid;
		row-gap: 6px;
		label {
			margin-left: 10px;
		}
	}
	.skb {
		padding: 0 10px;
		font-size: 11px;
		text-align: center;
		p {
			margin: 0;
		}
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
