<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade } from 'svelte/transition';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../_appbar.svelte';
	import DrawerContent from '../_drawer.svelte';
	import FooterContent from '../_footer.svelte';

	import { page } from '$app/stores';
	import { Diff, wait } from '$lib/helper';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Product';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let progress: Progress;

	let id = +$page.params.id;
	let product: ClientApi.Admin.Product;
	let copy: any = {};
	let file: File | undefined;
	let disable = true;

	$: {
		if (product) {
			const changed = Diff.object(copy, product);
			if (changed) {
				disable = false;
			} else {
				disable = true;
			}
		}
	}

	onMount(init);

	async function init() {
		try {
			await client.ready;
			product = await client.admin.product(id);
			copy = Diff.objectCopy(product);
		} catch (error: any) {
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
		} catch (error: any) {
		} finally {
		}
	}
	async function save() {
		try {
			progress.showing();
			disable = true;

			if (!product) throw new Error('');

			const changed = Diff.object(copy, product);

			if (changed) {
				if (changed.image && file) {
					changed.image = await client.product.uploadImage(
						`${product.storeId}/${product.name}/${file.name}`,
						file
					);
				}
				const result = await client.product.update({ where: { id: product.id }, data: changed });
				Diff.objectAssign(copy, result);
			}
		} catch (error: any) {
			disable = false;
		} finally {
			progress.hiding();
		}
	}
	function inputFile(this: HTMLInputElement) {
		file = this.files?.[0];
		if (file && product) {
			product.image = URL.createObjectURL(file);
			product = product;
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="text-gray-900 bg-gray-50 dark:text-gray-50 dark:bg-gray-900">
	<section transition:fade class="flex">
		<Drawer show={drawerOpened} class="bg-base-100">
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
				<form on:submit|preventDefault={save} class="grid p-6 bg-base-100 rounded-lg">
					{#if product}
						<div class="grid gap-12 w-[320px] justify-self-center">
							<div class="grid gap-4">
								<div class="grid justify-center">
									<div class="avatar placeholder justify-self-center">
										<div
											class="bg-base-200 text-base-content w-24 h-w-24 rounded-md relative hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
										>
											<input
												on:input={inputFile}
												id="image"
												type="file"
												accept="image"
												class="opacity-0 w-full h-full absolute cursor-pointer"
											/>
											{#if product.image}
												<img
													src={product.image}
													alt={product.description}
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
									<label for="image" class="label cursor-pointer">
										<div class="label-text">Upload Image</div>
									</label>
								</div>
								<div class="form-control">
									<label class="label cursor-pointer">
										<span class="label-text">Sale</span>
										<input
											type="checkbox"
											bind:checked={product.forSale}
											class="toggle toggle-primary"
										/>
									</label>
								</div>
								<div class="form-control">
									<label for="username" class="label">
										<span class="label-text">Name</span>
									</label>
									<input
										bind:value={product.name}
										id="username"
										type="text"
										placeholder="Name"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text">Price</span>
									</label>
									<input
										bind:value={product.price}
										id="email"
										type="number"
										placeholder="Price"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
								<div class="form-control">
									<label for="email" class="label">
										<span class="label-text">Stock</span>
									</label>
									<input
										bind:value={product.stock}
										id="tel"
										type="number"
										placeholder="Stock"
										class="input input-ghost bg-base-200 hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-100"
									/>
								</div>
							</div>
							<button
								type="submit"
								disabled={disable}
								class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
							>
						</div>
					{:else}
						<div class="grid gap-12 w-[320px] justify-self-center">
							<div class="grid justify-center">
								<div class="avatar placeholder justify-self-center">
									<div class="w-24 h-w-24 relative bg-base-200 rounded-md animate-pulse">
										<div class="object-cover object-center" />
									</div>
								</div>
							</div>
							<div class="grid gap-4">
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
								<div class="form-control animate-pulse">
									<input type="text" class="input bg-base-200" />
								</div>
							</div>
							<button
								type="submit"
								disabled={disable}
								class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
							>
						</div>
					{/if}
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
