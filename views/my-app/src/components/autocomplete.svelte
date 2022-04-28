<script context="module" lang="ts">
	import {
		Textarea,
		Menu,
		ListItem,
		ListItemGroup,
	} from 'svelte-materialify/src';
</script>

<script lang="ts">
	export let active = false;
	export let value = '';
</script>

<Menu offsetY bind:active closeOnClick>
	<span slot="activator">
		<slot name="input" />
	</span>
	<ListItemGroup bind:value>
		<slot name="item" />
	</ListItemGroup>
</Menu>
