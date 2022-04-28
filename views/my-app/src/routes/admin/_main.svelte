<script lang="ts">
	let classname = 'grid gap-6';
	export {classname as class};
	export let stretch = false;
	export let start = true;
</script>

<main class="p-6 {classname}">
	<slot />
</main>

<style lang="scss">
	.stretch {
		align-items: stretch;
	}
	.start {
		align-items: start;
	}
</style>
