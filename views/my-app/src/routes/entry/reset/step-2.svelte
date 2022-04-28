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
	import Alert from '$components/alert.svelte';

	import { onMount, getContext } from 'svelte';

	import { goto } from '$app/navigation';
	import { session } from '$app/stores';

	import type { BuyerClient } from '../../__layout.svelte';
</script>

<script lang="ts">
	const user = getContext<BuyerClient>('buyer');
	const pinChar = [0, 1, 2, 3, 4, 5];

	let loading = true;
	let pin: number[] = Array(6);
	let second = 0;
	let id = reset();
	let email = $session.email;
	let alert: Alert;
	let disableSubmit = true;

	function reset() {
		second = 40;
		return setInterval(() => {
			second -= 1;
			if (second == 0) {
				clearInterval(id);
			}
		}, 1000);
	}
	function onInput(this: HTMLInputElement) {
		if (this.value.length) {
			pin[+this.id] = +this.value.slice(-1);
			(this.nextElementSibling as HTMLElement)?.focus();
		}
	}
	async function generate() {
		try {
			if (second == 0) {
				await user.api.buyer.generate(email);
			}
		} catch (error: any) {
			alert.setState('error');
			alert.setText(error.message);
			alert.show();
		}
	}
	async function verify() {
		try {
			loading = true;
			disableSubmit = true;

			if (pin.length != pinChar.length) {
				throw new Error('Pin tidak mencukupi');
			}
			for (const char of pin) {
				if (typeof char != 'number') {
					throw new Error('Pin kosong');
				}
			}

			const result = await user.api.buyer.verify_reset({
				email,
				otp: pin.join(''),
			});

			if (result) {
				alert.setState('success');
				alert.setText('Berhasil Verifikasi');
				alert.show();

				window.removeEventListener('beforeunload', reload, { capture: true });

				$session = result;

				goto('/entry/reset/step-3', { replaceState: true });
			}
		} catch (error: any) {
			alert.setState('error');
			alert.setText(error.message);
			alert.show();

			disableSubmit = false;
		} finally {
			loading = false;
		}
	}
	function reload(event: BeforeUnloadEvent) {
		event.preventDefault();
		event.returnValue =
			'Ganti password sedang berlangsung jika anda mereload halaman maka ganti password akan gagal.';
		return event.returnValue;
	}
	onMount(() => {
		loading = false;
		if (!email) {
			throw new Error('Email not found');
		}
		disableSubmit = false;
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
		row-gap: 2px;
	}
	.content {
		width: 100%;
		display: grid;
		grid-template-rows: max-content max-content;
		row-gap: 32px;
	}
	.pin {
		display: flex;
		justify-content: center;
		gap: 8px;
		@include medium-up {
			gap: 16px;
		}
	}
	.input {
		text-align: center;
		width: 40px;
		height: 40px;
		border-radius: 6px;
		border: 2px solid black;
		transition: border ease 250ms;
	}
	.btns {
		display: grid;
		padding: 0 16px;
		row-gap: 16px;
	}
	.t-center {
		text-align: center;
	}
	.f-500 {
		font-weight: 500;
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
	<title>Verifikasi Email</title>
	<meta name="description" content="Verifikasi Email Lupa Password" />
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
			<form on:submit|preventDefault="{verify}" class="surface">
				<fieldset>
					<div class="content">
						<Card class="card" outlined>
							<Alert bind:this="{alert}" />
							<legend class="f-500 t-center"
								><div>Kode verifikasi telah dikirimkan melalui</div>
								<div class="red-text darken-1">{email}</div>
								<div>Mohon verifikasi.</div></legend
							>
							<div class="pin">
								{#each pinChar as char}
									<input
										autofocus="{char == 0}"
										id="{char + ''}"
										class="input"
										type="number"
										value="{pin[char]}"
										required
										on:input="{onInput}"
									/>
								{/each}
							</div>
						</Card>
						<div class="btns">
							<Button
								disabled="{disableSubmit}"
								type="submit"
								class="primary-color black-text">verifikasi</Button
							>
							{#if second}
								<div class="t-center">
									Mohon tunggu <span>{second}</span> detik untuk mengirim ulang.
								</div>
							{:else}
								<Button
									disabled="{disableSubmit}"
									class="black-text"
									type="reset"
									on:click="{() => {
										generate();
										id = reset();
									}}">Kirim Ulang</Button
								>
							{/if}
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>
