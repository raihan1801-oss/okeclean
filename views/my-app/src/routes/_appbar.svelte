<script context="module" lang="ts">
	import { fade } from "svelte/transition";

	import { AppBar, Button, Icon, TextField } from "svelte-materialify/src";
	import { mdiChevronLeft, mdiMagnify } from "@mdi/js";

	import { LANDING_URL } from "$lib/env";

	import { page } from "$app/stores";

	// import logo from "$static/logo_text.png";
</script>

<script lang="ts">
	export let search = "";
	export let desktop = false;
	export let loading = true;
	export let title = "";
	export let back_nav = false;
	export let search_bar = false;
	export let navigation = [
		{ name: "Home", link: "/" },
		{ name: "Pesanan", link: "/order/nota/semua" },
		{ name: "Tentang Kami", link: `${LANDING_URL}#about` },
		{ name: "Akun", link: "/account" },
	];
	const pathname = $page.url.pathname;
</script>

<AppBar
	class="appbar white {loading ? 'top-4' : ''} {desktop ? 'px-32 static' : ''}"
	height={desktop ? 100 : undefined}
>
	<div slot="icon">
		{#if back_nav}
			<Button fab icon text size="small" on:click={() => history.back()}>
				<Icon path={mdiChevronLeft} />
			</Button>
		{:else}
			<a transition:fade href="/" class="logo">
				<img src="logo.png" alt="Ada Ikan" height="44" />
			</a>
		{/if}
	</div>
	{#if title}
		<div transition:fade class="title {desktop ? 'mx-32' : ''}">{title}</div>
	{/if}
	{#if search_bar}
		<TextField
			class="search-box {desktop ? 'mx-24 w-300' : ''}"
			bind:value={search}
			dense
			outlined
			flat
			clearable
			placeholder="Cari Ikan..."
		>
			<Button slot="prepend" icon class="grey-text text-darken-4">
				<Icon path={mdiMagnify} />
			</Button>
		</TextField>
	{/if}
	{#if desktop}
		<div style="flex-grow: 1;" />
	{/if}
	{#if desktop}
		<nav transition:fade class="nav">
			<ul>
				{#each navigation as item}
					<li>
						<a href={item.link}
							>{item.name}
							<div class={pathname == item.link ? "active" : ""} />
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</AppBar>

<style lang="scss">
	@import "../components/common";
	.logo {
		display: grid;
		justify-items: center;
		gap: 4px;
		text-decoration: none;
		color: inherit;
		.name {
			font-weight: 600;
		}
	}
	.title {
		margin: auto 16px;
		font-size: 18px;
		font-weight: 500;
	}
	.nav {
		display: grid;
		font-weight: 600;
		ul {
			padding: 0;
			display: flex;
			justify-items: center;
			gap: 34px;
		}
		li {
			list-style: none;
			padding: 2px;
		}
		a {
			padding: 12px 0;
			position: relative;
			text-decoration: none;
			color: inherit;
			opacity: 0.8;
			&:hover {
				opacity: 1;
				div {
					bottom: 0;
					opacity: 1;
				}
			}
			div {
				position: absolute;
				bottom: -2px;
				width: 100%;
				height: 2px;
				background-color: black;
				opacity: 0;
				border-radius: 2px;
				transition: all 250ms ease;
			}
		}
		.active {
			bottom: 0;
			opacity: 1;
		}
	}
	* :global {
		@include common-appbar(appbar, false) {
			label {
				display: none;
			}
			.static {
				position: static;
			}
			.s-app-bar__title {
				display: none;
			}
			.s-input.dense .s-input__slot,
			.s-input__slot {
				margin-bottom: 0;
			}
			.s-text-field.dense input {
				padding: 0;
				line-height: normal;
			}
			.s-text-field__wrapper {
				background-color: white;
			}
		}
		.search-box {
			margin: auto 16px;
		}
		.w-300 {
			width: 300px;
		}
		.mx-24 {
			padding-left: 24px;
			padding-right: 24px;
		}
		.mx-32 {
			padding-left: 32px;
			padding-right: 32px;
		}
		.px-32 {
			padding-left: 32px;
			padding-right: 32px;
		}
	}
</style>
