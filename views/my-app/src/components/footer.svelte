<script context="module" lang="ts">
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let fixed = false;
	export let sticky = true;
	export let strict = false;
</script>

<footer class="flex items-center gap-4 px-4 py-2 {classname}" class:fixed class:sticky class:strict>
	<slot />
</footer>

<style lang="scss">
  footer {
    min-height: 64px;
  }
	.strict {
		contain: strict;
	}
	.fixed {
		position: fixed;
	}
	.sticky {
		position: sticky;
	}
</style>
