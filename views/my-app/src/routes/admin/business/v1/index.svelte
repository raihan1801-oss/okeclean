<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	import SideBar from '../../_side-bar.svelte';
	import AppBar from '../../_app-bar.svelte';
	import Main from '../../_main.svelte';
	import Footer from '../../_footer.svelte';
	import Progress from '$components/progress.svelte';

	import { Diff } from '$lib/helper';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Business';
	const desc = 'Business';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let loader: Progress;
	let profile = { image: '', name: '', role: '' };
	let config: ClientApi.Admin.Data['business'];
	let disable = false;
	let copy: any;
	let slides: { src: string; link: string }[] = [];
	let dataSlide: FormData;
	let errorText = '';

	onMount(async () => {
		try {
			await client.ready;
			if (!$user) {
				return goto(base + '/');
			}
			slides = await client.admin.getSlide();
			profile = {
				image: $user?.image as any,
				name: $user?.username as any,
				role: $user?.role as any
			};
			config = await client.admin.getBusiness();
			copy = Diff.objectCopy(config);
		} catch (error: any) {
			console.error(error);
		} finally {
			loader.hiding();
		}
	});

	async function save() {
		try {
			loader.showing();
			disable = true;
			const changed = Diff.object(copy, config);
			if (changed) {
				const decision = Diff.objectCopy(config);
				const result = await client.admin.setBusiness(decision);
				config = result;
				Diff.objectAssign(copy, config);
			}
			if (dataSlide) {
				const result = await client.admin.setSlide(dataSlide);
			}
		} catch (error: any) {
			errorText = error.message;
		} finally {
			disable = false;
			loader.hiding();
		}
	}
	function inputFile(this: HTMLInputElement) {
		if (this.files) {
			slides = [];
			dataSlide = new FormData();
			for (let index = 0; index < this.files.length; index++) {
				const file = this.files[index];
				dataSlide.append(index + '', file);
				slides.push({ src: URL.createObjectURL(file), link: '' });
			}
			slides = slides;
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<section class="grid grid-flow-col grid-cols-[2.5fr,9.5fr] bg-base-100">
	<SideBar />
	<section class="flex flex-col">
		<AppBar account={profile} />
		<Progress bind:this={loader} />
		<Main>
			<section>
				<div class="text-3xl text-base-content font-bold">{title}</div>
			</section>
			<form on:submit|preventDefault={save} class="grid bg-base-200 p-6 rounded-lg">
				<div class="grid gap-12 w-[320px] justify-self-center">
					<div class="grid gap-4">
						{#if config}
							<div class="form-control">
								<label for="delivery-cost-distance" class="label">
									<span class="label-text">Delivery Cost Per Distance (kg)</span>
									<input
										type="checkbox"
										bind:checked={config.deliveryCostCalculatePerDistanceActive}
										class="toggle toggle-primary"
									/>
								</label>
								<input
									bind:value={config.deliveryCostCalculatePerDistance}
									type="number"
									id="delivery-cost-distance"
									class="input input-ghost input-primary bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="product-price" class="label">
									<span class="label-text">Product Price Increase</span>
									<input
										type="checkbox"
										bind:checked={config.productPriceIncreaseActive}
										class="toggle toggle-primary"
									/>
								</label>
								<input
									bind:value={config.productPriceIncrease}
									type="number"
									id="product-price"
									class="input input-ghost input-primary bg-base-300"
								/>
							</div>
							<div class="form-control">
								<label for="image" class="label">
									<span class="label-text">Slides</span>
								</label>
								<div
									class="px-3 py-2 border border-primary bg-base-300 rounded-md flex flex-wrap gap-4"
								>
									{#each slides as slide, index}
										<div
											class="form-control p-4 flex flex-col flex-grow gap-2 rounded-md bg-base-200 relative"
										>
											<button
												on:click={() => {
													slides.splice(index, 1);
													slides = slides;
												}}
												class="btn btn-xs btn-square btn-error grid place-content-center absolute top-2 left-2"
											>
												<svg
													class="w-6 h-6"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
													><path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M6 18L18 6M6 6l12 12"
													/></svg
												>
											</button>
											<label for="image-{index}" class="label justify-center ">
												<img src={slide.src} alt="" class="h-full" />
											</label>
											<input
												bind:value={slide.link}
												id="image-{index}"
												type="url"
												class="input input-primary input-sm"
											/>
										</div>
									{/each}
									<div class="flex flex-grow relative cursor-pointer">
										<input
											on:input={inputFile}
											id="image"
											type="file"
											accept="image"
											multiple
											class="w-full h-full absolute opacity-0 z-10 cursor-pointer"
										/>
										<svg
											class="w-8 h-8"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/></svg
										>
									</div>
								</div>
							</div>
						{:else}
							<div class="px-1 py2 bg-base-300 rounded min-h-12 animate-pulse">&nbsp;</div>
							<div class="px-1 py2 bg-base-300 rounded min-h-12 animate-pulse">&nbsp;</div>
							<div class="px-1 py2 bg-base-300 rounded min-h-12 animate-pulse">&nbsp;</div>
						{/if}
					</div>
					<button
						type="submit"
						disabled={disable}
						class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
					>
				</div>
			</form>
		</Main>
		<dir class="flex-grow" />
		<Footer />
	</section>
</section>

<style lang="scss"></style>
