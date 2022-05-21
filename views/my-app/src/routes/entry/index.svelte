<script context="module" lang="ts">
	import {
		MaterialAppMin,
		ProgressLinear,
		AppBar,
		Button,
		Icon,
	} from 'svelte-materialify/src';
	import {
		mdiChevronLeft,
	} from '@mdi/js';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade, slide, scale } from 'svelte/transition';

	let theme = writable<'light' | 'dark'>('light');
	let showProgress = writable(true);
	let progress = writable(0);
	let indeterminate = writable(true);
</script>

<script lang="ts">
	onMount(init);
	onDestroy(release);
	function init() {
		loaded();
	}
	function release() {}
	function loading() {
		$showProgress = true;
	}
	function loaded() {
		$showProgress = false;
	}
</script>

<svelte:head>
	<title>Entry</title>
	<meta name="description" content="Entry" />
</svelte:head>

<div transition:fade>
	<MaterialAppMin theme="{$theme}">
		<ProgressLinear
			bind:active="{$showProgress}"
			bind:indeterminate="{$indeterminate}"
			bind:value="{$progress}"
			backgroundColor="secondary-color"
			color="secondary-color" />
		<section class="container">
			<AppBar class="transparent" tile flat>
				<span slot="icon">
					<Button fab icon text size="small" on:click="{() => history.back()}">
						<Icon path="{mdiChevronLeft}" />
					</Button>
				</span>
			</AppBar>
			<section class="layout primary-color">
				<div class="surface">
					<img
						class="logo"
						src="/logo.png"
						alt="oke clean"
						width="150"
						height="150" />
					<div class="btns">
						<Button depressed on:click="{() => goto('/entry/login')}"
							>Masuk</Button>
						<Button depressed on:click="{() => goto('/entry/register')}"
							>Daftar</Button>
					</div>
				</div>
			</section>
		</section>
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	.layout {
		max-width: 100vw;
		min-height: 100vh;
		padding: 32px;
		display: grid;
		@include small-up {
			padding: 32px 15%;
		}
	}
	.surface {
		min-height: 100%;
		position: relative;
		display: grid;
		@include medium-up {
			margin: auto;
			min-width: 500px;
		}
	}
	.logo {
		margin: auto;
	}
	.btns {
		width: 100%;
		position: absolute;
		bottom: 0;
		display: grid;
		gap: 16px;
		@include medium-up {
			grid-auto-flow: column;
		}
	}
	* :global {
		@include common-app;
		@include common-loader;
		@include common-appbar {
			position: fixed;
		};
	}
</style>
