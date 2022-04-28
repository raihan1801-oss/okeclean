<script context="module" lang="ts">
</script>

<script lang="ts">
	let classname = '';
	export { classname as class };
	export let mode = 'dark';
	// $: toggle_classname(classname);
	$: toggle_mode(classname, mode);
	let body: HTMLBodyElement | null;
	// let html: HTMLHtmlElement | null;
	function init(node: HTMLBodyElement) {
		// html = document.querySelector('html');
		body = node;
		toggle_classname();
		toggle_mode();
	}
	function toggle_classname(...tag: any[]) {
		if (body) {
			body.className = `${mode} ${classname}`
		}
	}
	function toggle_mode(...tag: any[]) {
		// if (html) {
		// 	html.className = mode;
		// 	html.setAttribute('data-theme', mode);
		// }
		if (body) {
			body.setAttribute('data-theme', mode);
			body.className = `${mode} ${classname}`
			// body.classList.toggle(mode)
		}
	}
</script>

<svelte:body use:init />

<slot />

<style lang="scss">
</style>
