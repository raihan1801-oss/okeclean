<script context="module" lang="ts">
	import illustration_1 from '$static/illustration-1.png';
	import illustration_2 from '$static/illustration-2.png';
	import illustration_3 from '$static/illustration-3.png';
</script>

<script lang="ts">
	export let layout: 'row' | 'column' = 'column';
	export let gap = 0;
	export let px = 0;
	export let py = 0;
</script>

<style lang="scss">
	@import '../components/common';
	@import '../components/elevation';
	.cards {
		padding: var(--py) var(--px);
		display: grid;
		gap: var(--gap);
	}
	.card {
		@include elevation;
		width: 100%;
    padding: 16px;
		border-radius: 6px;
    font-size: 18px;
    font-weight: 600;
		color: var(--text-primary-darken);
		background-color: white;
		img {
			object-fit: cover;
			object-position: center;
		}
	}
</style>

<section
	class="cards"
	style="grid-auto-flow: {layout}; --px: {px}px;--py: {py}px;--gap: {gap}px"
>
	<div class="card" style="display: flex; gap: 16px; place-content: center; place-items: center;">
		<img src="{illustration_1}" alt="ulustrasi" />
		<div>Belanja Lebih Mudah</div>
	</div>
	<div class="card" style="display: grid; gap: 16px; place-content: center; place-items: center;">
		<div>Diskon S/D</div>
		<img src="{illustration_2}" alt="ulustrasi" />
	</div>
	<div class="card" style="display: flex; gap: 16px; place-content: center; place-items: center;">
		<div>Beragam Jenis Ikan</div>
		<img src="{illustration_3}" alt="ulustrasi" />
	</div>
</section>
