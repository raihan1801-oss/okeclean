<script context="module">
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
  export let sticky = false;
</script>

<header id="host" class="{classname}" class:sticky>
	<slot>
		{#if $$slots.icon}
			<span id="left"><slot name="icon" /></span>
		{/if}
		{#if $$slots.title}
			<span id="center"><h1 id="h1"><slot name="title" /></h1></span>
		{/if}
		{#if $$slots.menu}
			<span id="right"><slot name="menu" /></span>
		{/if}
	</slot>
</header>

<style lang="scss">
  @import './elevation';
  .sticky {
    position: sticky;
    top: 0;
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
    @include elevation(1);
	}
	#left {
		max-width: 48px;
	}
	#h1 {
		margin: 0;
		line-height: normal;
		font-size: 20px;
		font-weight: 500;
	}
	#center,
	#right {
		flex: 1 1 auto;
	}
</style>
