<script context="module">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { navigating } from '$app/stores';
</script>

<script lang="ts">
	import Sequence from '$lib/sequence-loading';

	const sequence = new Sequence({ timeout: 15000, completion: 1000, alwaysReset: true });
	const value = tweened(0, {
		duration: 16,
		easing: cubicOut
	});

	export let show = true;
	export let sticky = true;
	export let absolute = false;
	export let fixed = false;
	export let progress = $value;

	sequence.onStart = () => {
		show = true;
	};
	sequence.onProgress = (data) => {
		progress = data;
	};
	sequence.onFinish = () => {
		show = false;
	};
	sequence.start();

	$: {
		const navigation = $navigating;
		if (navigation?.from.pathname != navigation?.to.pathname) {
			showing();
		}
	}

	export function showing() {
		sequence.start();
	}
	export function hiding() {
		sequence.finish();
	}
</script>

<progress
	value={progress}
	max="100"
	class:show
	class:hide={!show}
	class:sticky
	class:absolute
	class:fixed
	class="progress progress-secondary bg-base-200 w-full"
/>

<style lang="scss">
	progress {
		transition: height 250ms ease-out;
		z-index: 1;
	}
	.pos {
		top: 0;
		left: 0;
	}
	.sticky {
		position: sticky;
		@extend .pos;
	}
	.absolute {
		position: absolute;
		@extend .pos;
	}
	.fixed {
		position: fixed;
		@extend .pos;
	}
	.show {
		height: 4px;
	}
	.hide {
		height: 0;
	}
</style>
