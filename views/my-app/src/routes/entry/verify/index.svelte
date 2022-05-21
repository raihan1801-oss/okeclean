<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		Button,
		AppBar,
		Icon,
		Card,
	} from "svelte-materialify/src";
	import { mdiChevronLeft } from "@mdi/js";
	import Alert from "$components/alert.svelte";

	import { onMount, getContext } from "svelte";

	import { goto } from "$app/navigation";
	import { session } from "$app/stores";

	import type { BuyerClient } from "../../__layout.svelte";
</script>

<script lang="ts">
	const user = getContext<BuyerClient>("buyer");
	const pinChar = [0, 1, 2, 3, 4, 5];
	let user_login: BuyerClient.User;
	let pin: number[] = Array(6);
	let inputs: HTMLInputElement[] = [];
	let second = 0;
	let id = reset();
	let loading = true;
	let alert: Alert;
	let disableSubmit = true;

	onMount(async () => {
		try {
			await user.ready;
			user_login = await user.api.user.auth();
			disableSubmit = false;
		} catch (error: any) {
			alert.setState("error");
			alert.setText(error.message);

			disableSubmit = false;
			alert.show();
		} finally {
			loading = false;
		}
		// window.addEventListener("beforeunload", reload, { capture: true });
	});
	function reset() {
		pin = Array(6);
		second = 60;
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
	// function reload(event: BeforeUnloadEvent) {
	// 	event.preventDefault();
	// 	event.returnValue =
	// 		"Pendaftaran anda sedang berlangsung jika anda mereload halaman maka pendaftaran akan gagal.";
	// 	return event.returnValue;
	// }
	async function verify() {
		try {
			loading = true;
			disableSubmit = true;

			if (!user_login) {
				throw new Error("Email tidak ada");
			}
			if (pin.length != pinChar.length) {
				throw new Error("Pin tidak mencukupi");
			}
			for (const char of pin) {
				if (typeof char != "number") {
					throw new Error("Pin kosong");
				}
			}

			const data = await user.api.user.verify_otp({
				code: pin.join(""),
				email: user_login.email,
			});

			if (data) {
				alert.setState("success");
				alert.setText("Berhasil Verifikasi");
				alert.show();

				// window.removeEventListener("beforeunload", reload, { capture: true });

				goto("/", { replaceState: true });
			}
		} catch (error: any) {
			alert.setState("error");
			alert.setText(error.message);
			alert.show();

			disableSubmit = false;
		} finally {
			loading = false;
		}
	}
	async function generate() {
		try {
			if (second == 0) {
				return await user.api.user.generate_otp({
					email: user_login.email,
				});
			}
		} catch (error: any) {
			alert.setState("error");
			alert.setText(error.message);
			alert.show();
		}
	}
</script>

<svelte:head>
	<title>Verifikasi Email</title>
	<meta name="description" content="Verifikasi Email" />
</svelte:head>

<div>
	<MaterialAppMin>
		<ProgressLinear
			bind:active={loading}
			indeterminate
			height="4px"
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<AppBar class="primary-color">
			<div slot="icon">
				<Button depressed fab text on:click={() => history.back()}>
					<Icon path={mdiChevronLeft} />
				</Button>
			</div>
			<span slot="title">Verifikasi Email</span>
		</AppBar>
		<main>
			<form on:submit|preventDefault={verify} class="surface">
				<fieldset>
					<div class="content">
						<Card class="card" outlined>
							<Alert bind:this={alert} />
							<legend class="f-500 t-center">
								<div>Kode verifikasi telah dikirimkan ke</div>
								<div class="red-text darken-1">{user_login?.email ?? ""}</div>
								<div>Mohon verifikasi.</div>
							</legend>
							<div class="pin">
								{#each pinChar as char}
									<input
										autofocus={char == 0}
										id={char + ""}
										class="input"
										type="number"
										value={pin[char]}
										required
										on:input={onInput}
									/>
								{/each}
							</div>
						</Card>
						<div class="btns">
							<Button
								disabled={disableSubmit}
								type="submit"
								class="primary-color black-text">verifikasi</Button
							>
							{#if second}
								<div class="t-center">
									Mohon tunggu <span>{second}</span> detik untuk mengirim ulang.
								</div>
							{:else}
								<Button
									disabled={disableSubmit}
									type="reset"
									class="black-text"
									on:click={() => {
										generate();
										id = reset();
									}}>Kirim Ulang</Button
								>
							{/if}
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import "../../../components/common";
	@import "../../../components/elevation";
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
		@include elevation;
		text-align: center;
		width: 40px;
		height: 40px;
		border-radius: 6px;
		border: 2px solid black;
		transition: border ease 250ms;
		appearance: unset;
	}
	.btns {
		display: grid;
		padding: 0 16px;
		row-gap: 16px;
	}
	.t-center {
		text-align: center;
	}
	.t-32 {
		font-size: 32px;
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
		.btns {
			@include btn-default;
		}
	}
</style>
