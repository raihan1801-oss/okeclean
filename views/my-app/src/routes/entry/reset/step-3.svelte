<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		Button,
		TextField,
		AppBar,
		Icon,
		Card,
	} from 'svelte-materialify/src';
	import { mdiChevronLeft } from '@mdi/js';
	import { mdiEye, mdiEyeOff } from '@mdi/js';
	import Alert from '$components/alert.svelte';

	import { onMount, getContext } from 'svelte';

	import { goto } from '$app/navigation';
	import { session } from '$app/stores';

	import type { BuyerClient } from '../../__layout.svelte';
</script>

<script lang="ts">
	const user = getContext<BuyerClient>('buyer');
	const rules = [
		(value: string) => value.length > 3 || 'Min 4 characters',
		(value: string) => value.length < 17 || 'Max 16 characters',
	];
	let showPassword = false;
	let value = '';
	let messages: string[] = [];
	let loading = true;
	let data = $session as { username: string; email: string };
	let alert: Alert;

	function reload(event: BeforeUnloadEvent) {
		event.preventDefault();
		event.returnValue =
			'Ganti password sedang berlangsung jika anda mereload halaman maka ganti password akan gagal.';
		return event.returnValue;
	}
	async function submit() {
		try {
			loading = true;
			await user.api.buyer.resetPassword({
				username: data.username,
				email: data.email,
				new_password: value,
			});
			await user.api.buyer.login({
				username: data.username,
				password: value,
			});
			$session = { email: data.email };
			goto('/entry/reset/step-4', { replaceState: true });
		} catch (error: any) {
			alert.setState('error');
			alert.setText(error.message);
			alert.show();
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loading = false;
		if (!data) {
			throw new Error('Data not found');
		}
		window.addEventListener('beforeunload', reload, { capture: true });
	});
</script>

<style lang="scss">
	@import '../../../components/common';
	@import '../../../components/elevation';
	main {
		display: flex;
		width: 100%;
		height: 100%;
		padding: 32px 16px;
		@include main;
	}
	.surface {
		width: 100%;
		height: 100%;
		display: grid;
		grid-auto-rows: auto;
		row-gap: 32px;
	}
	fieldset {
		display: contents;
	}
	legend {
		display: grid;
		row-gap: 16px;
	}
	.content {
		width: 100%;
		display: grid;
		grid-template-rows: max-content max-content;
		row-gap: 32px;
	}
	.btns {
		display: grid;
		padding: 0 16px;
	}
	.f-14 {
		font-size: 14px;
	}
	.f-16 {
		font-size: 16px;
	}
	.f-500 {
		font-weight: 500;
	}
	.t-center {
		text-align: center;
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar;
		.card {
			display: grid;
			row-gap: 16px;
			padding: 16px;
			@include elevation;
		}
		.textfield {
			.s-text-field__input {
				input {
					max-height: 36px;
					padding-bottom: 6px;
					line-height: 34px;
				}
			}
		}
	}
</style>

<svelte:head>
	<title>Atur Password</title>
	<meta name="description" content="Atur Password" />
</svelte:head>

<div>
	<MaterialAppMin>
		<ProgressLinear
			bind:active="{loading}"
			indeterminate
			height="4px"
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<AppBar class="primary-color">
			<div slot="icon">
				<Button depressed fab text on:click="{() => history.back()}">
					<Icon path="{mdiChevronLeft}" />
				</Button>
			</div>
			<span slot="title">Reset Password</span>
		</AppBar>
		<main>
			<form class="surface" on:submit|preventDefault="{submit}">
				<fieldset>
					<div class="content">
						<Card class="card" outlined>
							<Alert bind:this="{alert}" />
							<legend class="t-center">
								<div class="f-16 f-500">Atur Password Kamu</div>
								<div class="f-14">
									<div>Buat password baru untuk</div>
									<div class="f-500">{data.email}</div>
								</div>
							</legend>
							<TextField
								class="textfield"
								bind:value
								bind:messages
								rules="{rules}"
								filled
								type="{showPassword ? 'text' : 'password'}"
								required
								>Password
								<div
									slot="append"
									on:click="{() => {
										showPassword = !showPassword;
									}}"
								>
									<Icon
										class="grey-text text-darken-3"
										path="{showPassword ? mdiEyeOff : mdiEye}"
									/>
								</div>
							</TextField>
						</Card>
						<div class="btns">
							<Button class="primary-color black-text" type="submit"
								>berikutnya
							</Button>
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>
