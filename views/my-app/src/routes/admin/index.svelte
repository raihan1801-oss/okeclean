<script context="module" lang="ts">
	import type { LoadOutput } from '@sveltejs/kit';

	export function load(): LoadOutput {
		return {
			status: 303,
			redirect: '/admin/dashboard/'
		};
	}
</script>
