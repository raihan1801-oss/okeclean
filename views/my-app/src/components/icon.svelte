<script context="module">
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let path = '';
	export let width = 24;
	export let height = 24;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
  class={classname}
	width="{width}px"
	height="{height}px"
	viewBox="0 0 {width} {height}"><path d="{path}"></path></svg>

<style lang="scss">
  svg {
    --font-size: 24px;
    fill: currentColor;
    line-height: normal;
    font-size: var(--font-size);
  }
</style>
