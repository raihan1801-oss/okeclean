<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		Button,
		AppBar,
		Icon,
		Card,
	} from 'svelte-materialify/src';
	import { mdiChevronLeft, mdiCheckCircleOutline } from '@mdi/js';

	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
</script>

<script lang="ts">
	let loading = true;
	let email = $session.email;

	onMount(() => {
		loading = false;
		if (!email) {
			throw new Error('Email not found');
		}
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
			@include elevation(2);
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
	<title>Berhasil</title>
	<meta name="description" content="Berhasil Reset Password" />
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
			<form class="surface">
				<fieldset>
					<div class="content">
						<Card class="card" outlined>
							<legend class="t-center">
								<div class="f-16 f-500">Reset Password Brehasil</div>
								<div>
									<Icon
										class="primary-text"
										size="40px"
										path="{mdiCheckCircleOutline}"
									/>
								</div>
								<div class="f-14">
									<div>
										Berhasil mengatur ulang password untuk akun dengan email <span
											class="f-500">{email}</span
										>
									</div>
								</div></legend
							>
						</Card>
						<div class="btns">
							<Button
								class="primary-color black-text"
								on:click="{() => goto('/', { replaceState: true })}"
								>Beranda</Button
							>
						</div>
					</div>
				</fieldset>
			</form>
		</main>
	</MaterialAppMin>
</div>
