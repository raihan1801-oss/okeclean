<script context="module" lang="ts">
	// import Carousel from 'svelte-carousel/src/components/Carousel/Carousel.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/env';
</script>

<script lang="ts">
	export let slides: { src: string; href: string; loaded?: boolean }[] = [];
	export let desktop = false;

	let Carousel: any;
	let carousel: any;

	onMount(async () => {
		const module = await import('svelte-carousel');
		Carousel = module.default;
	});
</script>

{#if browser}
	<section class="carousel">
		{#if slides.length == 0}
			<div class="img loading" />
		{:else}
			<svelte:component
				this={Carousel}
				bind:this={carousel}
				autoplay
				pauseOnFocus
				dots
				arrows={desktop}
			>
				{#each slides as slide}
					<a href={slide.href} class="link">
						<img
							class="img {slide.loaded ? '' : 'loading'}"
							src={slide.src}
							alt=""
							on:load={() => (slide.loaded = true)}
						/>
					</a>
				{/each}
			</svelte:component>
			<!-- <Carousel autoplay pauseOnFocus dots arrows={desktop}>
				{#each slides as slide}
					<a href={slide.href} class="link">
						<img
							class="img {slide.loaded ? '' : 'loading'}"
							src={slide.src}
							alt=""
							on:load={() => (slide.loaded = true)}
						/>
					</a>
				{/each}
			</Carousel> -->
		{/if}
	</section>
{:else}
	<section class="carousel">
		<div class="img loading" />
	</section>
{/if}

<style lang="scss">
	@import '../components/common';
	@import '../components/skeleton';
	.loading {
		@include loading-sekeleton;
		display: grid;
		aspect-ratio: 4/2;
	}
	.carousel {
		width: 100%;
		aspect-ratio: 4/2;
		.link {
			display: block;
		}
		.img {
			width: 100%;
			aspect-ratio: 4/2;
			object-fit: cover;
			object-position: center;
		}
		@include large-up {
			padding: 32px;
		}
	}
	:global {
		.carousel {
			z-index: 0;
			@include medium-up {
				--sc-dot-size: 12px;
				--sc-active-dot-size: 16px;
			}
			.sc-carousel__carousel-container {
				position: relative;
			}
			.sc-carousel__arrow-container {
				position: absolute;
				height: 100%;
				display: grid;
				place-content: center;
				z-index: 1;
				&:last-child {
					right: 0;
				}
			}
			.sc-carousel-arrow__circle {
				width: 44px;
				height: 44px;
				transition: all 250ms ease;
				&:hover {
					opacity: 0.7;
					background-color: white;
				}
			}
			.sc-carousel-arrow__arrow {
				width: 10px;
				height: 10px;
				transition: all 250ms ease;
			}
			.sc-carousel-dots__container {
				position: absolute;
				bottom: 8px;
			}
			.sc-carousel-dot__dot_active {
				background-color: white;
			}
		}
	}
</style>
