<script context="module">
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let sticky = false;
</script>

<footer id="host" class="{classname}" class:sticky>
	<slot>
		{#if $$slots.left}
			<span id="left"><slot name="left" /></span>
		{/if}
		{#if $$slots.center}
			<span id="center"><slot name="center" /></span>
		{/if}
		{#if $$slots.right}
			<span id="right"><slot name="right" /></span>
		{/if}
	</slot>
</footer>

<style lang="scss">
	@import './elevation';
	.sticky {
		position: sticky;
		bottom: 0;
	}
	#host {
		padding: 0 8px;
		display: flex;
		align-items: center;
		column-gap: 16px;
		width: stretch;
		height: 64px;
		contain: strict;
		content-visibility: visible;
		z-index: 1;
		@include elevation(1, true);
	}
	#left,
	#center,
	#right {
		display: flex;
		width: stretch;
		height: stretch;
		flex: 1 1 auto;
	}
</style>
