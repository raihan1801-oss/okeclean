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
	import { onMount, getContext } from 'svelte';

	import { goto } from '$app/navigation';
	import { session } from '$app/stores';

	import type { BuyerClient } from '../../__layout.svelte';
</script>

<script lang="ts">
	const user = getContext<BuyerClient>('buyer');
	const emailRules = [
		(value: string) => !!value || 'Required',
		(value: string) => value.length <= 25 || 'Max 25 characters',
		(value: string) => {
			const pattern =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return pattern.test(value) || 'Invalid e-mail.';
		},
	];
	let value = '';
	let messages: string[] = [];
	let loading = true;
	async function submit() {
		try {
			loading = true;
			await user.api.buyer.generate(value);
			$session = { email: value };
			goto('/entry/reset/step-2', { replaceState: true });
		} catch (error: any) {
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		loading = false;
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
	<title>Masukkan Email</title>
	<meta name="description" content="Masukkan Email Lupa Password" />
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
							<legend class="f-500"
								>Masukkan email anda yang sudah terdaftar.</legend
							>
							<TextField
								class="textfield"
								bind:value
								bind:messages
								filled
								rules="{emailRules}"
								autocomplete="email"
								type="emai"
								required>Email</TextField
							>
						</Card>
						<div class="btns">
							<Button class="primary-color black-text" type="submit"
								>berikutnya</Button
							>
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>
