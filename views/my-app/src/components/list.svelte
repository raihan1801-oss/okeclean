<script context="module" lang="ts">
	import { getContext, setContext, tick } from 'svelte';
	import { writable, derived } from 'svelte/store';
</script>

<script lang="ts">
	const self_value = writable<string | number | boolean>();

	setContext('valuable', self_value);

	let classname = '';
	
	export { classname as class };
	export let value: string | number | boolean = '';

	self_value.subscribe((s_value) => {
		if (s_value != undefined || s_value != null) {
			value = s_value;
		}
	});
</script>

<ul class="flex flex-col {classname}">
	<slot />
</ul>

<style lang="scss">
</style>
