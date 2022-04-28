<script context="module">
	import { onMount } from 'svelte';
	import { Datepicker } from "svelte-calendar";
</script>

<script lang="ts">
	export let selected = new Date();
	const opt = {
		calendar: {
			width: "500px",
			maxWidth: "30vw",
			legend: {
				height: "24px",
			},
			shadow: 'none'
		},
	};
</script>

<Datepicker theme={opt} bind:selected={selected} />

<style lang="scss">
	:global {
		.contents-wrapper {
			transform: none !important;
			position: relative !important;
			left: 0 !important;
			top: 0 !important;
			z-index: 0 !important;
			.contents .grid {
				border: 1px lightgrey solid;
			}
		}
		.button-container button {
			box-shadow: none !important;
			border: 1px lightgrey solid !important;
		}
	}
</style>
