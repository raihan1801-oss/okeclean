<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, scale, slide } from 'svelte/transition';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide as d_slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../dashboard/_appbar.svelte';
	import DrawerContent from '../dashboard/_drawer.svelte';
	import FooterContent from '../dashboard/_footer.svelte';
	import List from '$components/list.svelte';
	import ListItem from '$components/list-item.svelte';

	import { goto } from '$app/navigation';

	import { Diff, ProcessManagementUnsafe, genRandomNumber } from '$lib/helper';
	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	interface DailyCleaningFeature {
		building_areas: {
			hour: number;
			cost: number;
		}[];
		job_details: {
			name: string;
			image: string;
			image_file: object;
			count: number;
		}[];
	}
	interface SlideFeature {
		id: number;
		href: string;
		src: string;
	}

	const title = 'Business';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');
	const user_login = $user as ClientApi.User;
	let account = {
		image: user_login.image ?? '',
		name: user_login.name,
		role: user_login.role
	};
	let daily_cleaning: ClientApi.Feature;
	let slides: ClientApi.Feature;
	let daily_cleaning_data: DailyCleaningFeature = {
		building_areas: [],
		job_details: []
	};
	let slides_data: SlideFeature[] = [];
	let mode = 'dark';
	let drawerOpened = true;
	let progress: Progress;
	let proccess: ProcessManagementUnsafe;
	let state: '' | 'success' | 'failed' = '';
	let state_message = '';
	let disable = true;
	let copy: any = {};
	// let slides_image: FormData;
	// let errorText = '';

	$: diff(copy, daily_cleaning_data, slides_data);

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			proccess = new ProcessManagementUnsafe('', true);
			daily_cleaning = await client.feature.get({ name: 'daily-cleaning' });
			slides = await client.feature.get({ name: 'slides' });
			daily_cleaning_data = {
				building_areas: (daily_cleaning as any)?.data.building_areas ?? [],
				job_details: (daily_cleaning as any)?.data.job_details ?? []
			};
			slides_data = (slides as any)?.data ?? [];
			copy = Diff.objectCopy({ daily_cleaning_data, slides_data });
			// await client.ready;
			// if (!user_login) {
			// 	return goto('/admin', {replaceState: true});
			// }
			// account = {
			// 	image: user_login.image ?? '',
			// 	name: user_login.username,
			// 	role: user_login.role
			// };
			// config = await client.admin.getBusiness();
			// slides = await client.admin.getSlide();
			// slides_image = new FormData();
			// copy = Diff.objectCopy({ config, slides });
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}
	async function diff(...tag: any) {
		const changed = Diff.object(copy, { daily_cleaning_data, slides_data });
		if (changed) {
			state = '';
			disable = false;
		} else {
			disable = true;
		}
		return !disable;
	}
	async function save() {
		try {
			progress.showing();
			disable = true;
			const changed = Diff.object(copy, { daily_cleaning_data, slides_data });
			console.log(changed);
			console.log(proccess);
			if (changed) {
				proccess.start();
				await proccess.sleeped;
				if (changed.daily_cleaning_data) {
					if (daily_cleaning?.id) {
						daily_cleaning = await client.feature.update({
							id: daily_cleaning.id,
							data: { name: 'daily-cleaning', meta: {}, data: daily_cleaning_data }
						});
					} else {
						daily_cleaning = await client.feature.create({
							name: 'daily-cleaning',
							meta: {},
							data: daily_cleaning_data
						});
					}
					daily_cleaning_data = {
						building_areas: (daily_cleaning as any).data.building_areas ?? [],
						job_details: (daily_cleaning as any).data.job_details ?? []
					};
				}
				if (changed.slides_data) {
					if (slides?.id) {
						slides = await client.feature.update({
							id: slides.id,
							data: { name: 'slides', meta: {}, data: slides_data }
						});
					} else {
						slides = await client.feature.create({
							name: 'slides',
							meta: {},
							data: slides_data
						});
					}
					slides_data = (slides as any)?.data ?? [];
				}
				proccess.finish();
			}
			Diff.objectAssign(copy, { daily_cleaning_data, slides_data });
			state = 'success';
			state_message = 'Success Saved';
		} catch (error: any) {
			state = 'failed';
			state_message = error.message;
			disable = false;
		} finally {
			progress.hiding();
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="bg-neutral text-neutral-content">
	<section transition:fade class="flex">
		<Drawer min_width={false} show={drawerOpened} class="bg-base-100 w-[300px]">
			<DrawerContent />
		</Drawer>
		<Content class="flex-grow">
			<Appbar class="bg-base-100">
				<AppbarContent bind:account bind:mode bind:drawerOpened />
			</Appbar>
			<Progress bind:this={progress} />
			<Main>
				<section>
					<div class="text-2xl font-bold">{title}</div>
				</section>
				<form on:submit|preventDefault={save} class="grid bg-base-100 p-6 rounded-lg">
					<div class="grid gap-6 w-[400px] justify-self-center">
						{#if state == 'success'}
							<output class="alert alert-success">
								<div class="grid grid-flow-col gap-2">
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
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/></svg
									>
									<div class="text-justify">
										{state_message}
									</div>
								</div>
							</output>
						{:else if state == 'failed'}
							<output class="alert alert-error">
								<div class="grid grid-flow-col gap-2">
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
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/></svg
									>
									<div class="text-justify">
										{state_message}
									</div>
								</div>
							</output>
						{/if}
						<div>
							<div class="text-lg">Daily Cleaning</div>
							<div class="grid gap-4 py-4">
								<div>
									<div class="flex items-center text-sm">
										<div>Luas Bangunan</div>
										<div class="flex-grow" />
										<button
											type="button"
											class="btn btn-square bg-base-200 btn-sm"
											on:click={(event) => {
												daily_cleaning_data.building_areas.push({
													hour: 1,
													cost: 10000
												});
												daily_cleaning_data = daily_cleaning_data;
											}}
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
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/></svg
											>
										</button>
									</div>
									<List class="gap-2 py-2">
										{#each daily_cleaning_data.building_areas as item, index}
											<ListItem
												transition={slide}
												class="grid gap-2 bg-base-200 text-base-content p-2 rounded-md"
											>
												<div class="relative">
													<button
														type="button"
														class="btn btn-square bg-base-100 btn-sm absolute right-0"
														on:click={(event) => {
															daily_cleaning_data.building_areas.splice(index, 1);
															daily_cleaning_data = daily_cleaning_data;
														}}
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
												</div>
												<div>
													<label for="daily-duration-{index}" class="label">
														<span class="label-text">Durasi (perjam)</span>
													</label>
													<input
														id="daily-duration-{index}"
														type="number"
														step="1"
														min="1"
														max="24"
														placeholder="2"
														required
														class="input input-bordered w-full"
														bind:value={item.hour}
													/>
												</div>
												<div>
													<label for="daily-cost-{index}" class="label">
														<span class="label-text">Biaya (Rp)</span>
													</label>
													<input
														id="daily-cost-{index}"
														type="number"
														step="1000"
														min="1000"
														max="100000"
														placeholder="25000"
														required
														class="input input-bordered w-full"
														bind:value={item.cost}
													/>
												</div>
											</ListItem>
										{/each}
									</List>
								</div>
								<div>
									<div class="flex items-center text-sm">
										<div>Detail Pekerjaan</div>
										<div class="flex-grow" />
										<button
											type="button"
											class="btn btn-square bg-base-200 btn-sm"
											on:click={(event) => {
												daily_cleaning_data.job_details.push({
													count: 1,
													image: '',
													image_file: {},
													name: ''
												});
												daily_cleaning_data = daily_cleaning_data;
											}}
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
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/></svg
											>
										</button>
									</div>
									<List class="gap-2 py-2">
										{#each daily_cleaning_data.job_details as item, index}
											<ListItem
												transition={slide}
												class="grid gap-2 bg-base-200 text-base-content p-2 rounded-md"
											>
												<div class="relative">
													<button
														type="button"
														class="btn btn-square bg-base-100 btn-sm absolute right-0"
														on:click={(event) => {
															proccess.queue({ item }, async ({ item }) => {
																await client.feature.removeImage(item.image);
															});
															daily_cleaning_data.job_details.splice(index, 1);
															daily_cleaning_data = daily_cleaning_data;
														}}
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
												</div>
												<div class="grid justify-center">
													<div class="avatar placeholder justify-self-center">
														<div
															class="bg-base-100 text-base-content rounded-md w-16 h-16 relative cursor-pointer"
														>
															<input
																id="daily-image-{index}"
																type="file"
																accept="image"
																class="opacity-0 w-full h-full absolute"
																on:input={(event) => {
																	// @ts-ignore
																	const [file] = event?.target?.files;
																	item.image = URL.createObjectURL(file ?? {});
																	item.image_file = file;
																	daily_cleaning_data = daily_cleaning_data;
																	proccess.queue({ file, item }, async ({ file, item }) => {
																		const image = await client.feature.uploadImage(
																			`daily-image/${item.name}/${file.name}`,
																			file
																		);
																		item.image = image;
																	});
																}}
															/>
															{#if item.image}
																<img
																	src={item.image}
																	alt={item.name}
																	class="object-cover object-center"
																/>
															{:else}
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
															{/if}
														</div>
													</div>
													<label for="daily-image-{index}" class="label">
														<div class="label-text">Upload Image</div>
													</label>
												</div>
												<div>
													<label for="daily-name-{index}" class="label">
														<span class="label-text">Ruangan</span>
													</label>
													<input
														id="daily-name-{index}"
														placeholder="Kamar"
														required
														class="input input-bordered w-full"
														bind:value={item.name}
													/>
												</div>
												<div>
													<label for="daily-count-{index}" class="label">
														<span class="label-text">Jumlah</span>
													</label>
													<input
														id="daily-count-{index}"
														type="number"
														step="1"
														min="1"
														max="100"
														placeholder="5"
														required
														class="input input-bordered w-full"
														bind:value={item.count}
													/>
												</div>
											</ListItem>
										{/each}
									</List>
								</div>
							</div>
						</div>
						<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
						<div>
							<div class="form-control">
								<label for="slides-image" class="label">
									<span class="label-text text-lg">Slides</span>
								</label>
								<div
									class="px-3 py-2 border border-primary bg-base-200 rounded-md flex flex-wrap gap-4"
								>
									{#each slides_data as item, index}
										<div
											transition:slide
											class="form-control p-4 flex flex-col flex-grow rounded-md bg-base-100 relative"
										>
											<button
												type="button"
												on:click={() => {
													proccess.queue({ item }, async ({ item }) => {
														await client.feature.removeImage(item.src);
													});
													slides_data.splice(index, 1);
													slides_data = slides_data;
												}}
												class="btn btn-xs btn-square btn-error grid place-content-center absolute top-2 right-2"
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
											<label for="slide-{index}" class="label justify-center ">
												<img src={item.src} alt="" class="h-full rounded-sm" />
											</label>
											<div>
												<label for="slide-{index}" class="label">
													<div class="label-text">URL</div>
												</label>
												<input
													bind:value={item.href}
													id="slide-{index}"
													type="url"
													placeholder="https://okeclean/promo"
													required
													class="input input-sm bg-base-200 w-full"
												/>
											</div>
										</div>
									{/each}
									<div
										class="w-full flex-grow relative {slides_data.length
											? ' p-4 flex flex-col flex-grow gap-2 rounded-md bg-base-100'
											: ''}"
									>
										<input
											id="slides-image"
											type="file"
											accept="image/*"
											multiple
											class="w-full h-full absolute opacity-0 z-10 cursor-pointer"
											on:input={(event) => {
												// @ts-ignore
												const [file] = event.target.files;
												const slide = {
													id: genRandomNumber(),
													href: '',
													src: URL.createObjectURL(file ?? {})
												};
												slides_data.push(slide);
												proccess.queue({ slide, file }, async ({ slide, file }) => {
													const image = await client.feature.uploadImage(
														`slide-image/${slide.id}/${file.name}`,
														file
													);
													slide.src = image;
												});
												slides_data = slides_data;
											}}
										/>
										<svg
											class="w-8 h-8  z-0"
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
						</div>
						<!-- <div>
							<div class="text-lg">Daily Cleaning</div>
							<div class="grid gap-4 py-4">
								<div>
									<div class="text-sm">Luas Bangunan</div>
								</div>
								<div>
									<div class="text-sm">Detail Pekerjaan</div>
								</div>
							</div>
						</div> -->

						<!-- <div class="grid gap-4">
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
										class="input input-ghost input-primary bg-base-200"
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
										class="input input-ghost input-primary bg-base-200"
									/>
								</div>
								<div class="form-control">
									<label for="image" class="label">
										<span class="label-text">Slides</span>
									</label>
									<div
										class="px-3 py-2 border border-primary bg-base-200 rounded-md flex flex-wrap gap-4"
									>
										{#each slides as slide, index}
											<div
												class="form-control p-4 flex flex-col flex-grow gap-2 rounded-md bg-base-100 relative"
											>
												<button
													type="button"
													on:click={() => {
														slides_image.delete(index + '');
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
													bind:value={slide.href}
													id="image-{index}"
													type="url"
													required
													class="input input-sm bg-base-200"
												/>
											</div>
										{/each}
										<div
											class="w-full flex-grow relative {slides.length
												? ' p-4 flex flex-col flex-grow gap-2 rounded-md bg-base-100'
												: ''}"
										>
											<input
												on:input={inputFile}
												id="image"
												type="file"
												accept="image/*"
												multiple
												class="w-full h-full absolute opacity-0 z-10 cursor-pointer"
											/>
											<svg
												class="w-8 h-8  z-0"
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
								<div class="px-1 py2 bg-base-200 rounded min-h-12 animate-pulse">&nbsp;</div>
								<div class="px-1 py2 bg-base-200 rounded min-h-12 animate-pulse">&nbsp;</div>
								<div class="px-1 py2 bg-base-200 rounded min-h-12 animate-pulse">&nbsp;</div>
							{/if}
						</div> -->
						<button
							type="submit"
							disabled={disable}
							class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
						>
					</div>
				</form>
			</Main>
			<div class="flex-grow" />
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
</style>
