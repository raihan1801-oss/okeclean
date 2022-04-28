<script context="module" lang="ts">
	import { onMount, onDestroy } from 'svelte';
</script>

<script lang="ts">
	export let px = 0;
	export let py = 0;
	onMount(init);
	onDestroy(release);
	async function init() {}
	async function release() {}
</script>

<style lang="scss">
	.cards {
		display: grid;
		grid-template-rows: auto;
		gap: 16px;
		padding: var(--py) var(--px);
		@media (min-width: 0px) and (max-width: 300px) {
			grid-template-columns: 1fr;
		}
		@media (min-width: 301px) and (max-width: 600px) {
			grid-template-columns: 1fr 1fr;
		}
		@media (min-width: 601px) and (max-width: 900px) {
			grid-template-columns: 1fr 1fr 1fr;
		}
		@media (min-width: 901px) and (max-width: 1200px) {
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}
		@media (min-width: 1201px) {
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		}
	}
</style>

<section class="cards" style="--px: {px}px;--py: {py}px;">
	<slot />
</section>
