<script context="module" lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	import Page from '$components/page.svelte';
	import Appbar from '$components/appbar.svelte';
	import Drawer, { slide } from '$components/drawer.svelte';
	import Content from '$components/content.svelte';
	import Main from '$components/main.svelte';
	import Footer from '$components/footer.svelte';
	import Progress from '$components/progress.svelte';
	import AppbarContent from '../dashboard/_appbar.svelte';
	import DrawerContent from '../dashboard/_drawer.svelte';
	import FooterContent from '../dashboard/_footer.svelte';
	import Item from '$components/item.svelte';
	import Modal from '$components/modal.svelte';

	import { goto } from '$app/navigation';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Folder';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let user_login = $user;
	let progress: Progress;

	let working_dir: ClientApi.Admin.DirTree;
	let stack_dir: ClientApi.Admin.DirTree[] = [];
	let file_dir: ClientApi.Admin.DirFile | undefined = undefined;
	let selected_dir: ClientApi.Admin.DirTree | ClientApi.Admin.DirFile | undefined = undefined;
	let show_modal = false;
	let new_dir_name = '';

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;

			if (!user_login) {
				return goto('/admin', {replaceState: true});
			}

			account = {
				image: user_login.image ?? '',
				name: user_login.name,
				role: user_login.role
			};

			working_dir = await client.admin.folder();
			stack_dir = [working_dir];
			file_dir = undefined;
			selected_dir = undefined;

			console.log(working_dir);
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
	async function save() {
		try {
			progress.showing();
		} catch (error: any) {
		} finally {
			progress.hiding();
		}
	}
	async function upload() {
		try {
			progress.showing();
			if (working_dir) {
				const [file_handle] = await (window as any).showOpenFilePicker();
				const file = await file_handle.getFile();
				const dir_file = await client.admin.folder_upload(file, working_dir.path + `/${file.name}`);
				dir_file.href = working_dir.href + '\\' + dir_file.name;
				dir_file.path = working_dir.path + '\\' + dir_file.name;
				working_dir.files.push(dir_file);
				working_dir = working_dir;
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function download() {
		try {
			progress.showing();
			if (selected_dir) {
				if ('subs' in selected_dir) {
				} else {
					const dir_handle = await (window as any).showDirectoryPicker();
					const new_file_handle = await dir_handle.getFileHandle(selected_dir.name, {
						create: true
					});
					const response = await fetch(selected_dir.href);
					await response.body?.pipeTo(await new_file_handle.createWritable());
				}
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function create() {
		try {
			progress.showing();
			show_modal = false;
			if (new_dir_name) {
				const dir = await client.admin.folder_create(working_dir.path, new_dir_name);
				dir.href = working_dir.href + '\\' + dir.name;
				dir.path = working_dir.path + '\\' + dir.name;
				if ('subs' in dir) {
					working_dir.subs.push(dir);
				} else {
					working_dir.files.push(dir);
				}
				working_dir = working_dir;
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function remove() {
		try {
			progress.showing();
			if (selected_dir) {
				await client.admin.folder_remove(selected_dir.path);
				if ('subs' in selected_dir) {
					working_dir.subs = working_dir.subs.filter((dir) => dir.href != selected_dir?.href);
				} else {
					working_dir.files = working_dir.files.filter((dir) => dir.href != selected_dir?.href);
				}
				working_dir = working_dir;
				selected_dir = undefined;
			}
		} catch (error: any) {
			console.error(error);
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
				<form on:submit|preventDefault={save} class="flex flex-col rounded-lg">
					<div class="flex flex-col gap-12 justify-self-center">
						<div class="flex flex-col gap-4">
							{#if working_dir}
								<ul class="flex items-center gap-2 px-6 py-3 bg-base-100 rounded-md">
									{#each stack_dir as dir, index}
										{#if index}
											<svg
												class="w-4 h-4 opacity-70"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 5l7 7-7 7"
												/></svg
											>
										{/if}
										<li transition:fade class="flex">
											<button
												on:click={() => {
													stack_dir = stack_dir.slice(0, index + 1);
													working_dir = dir;
													file_dir = undefined;
													selected_dir = undefined;
												}}
												type="button"
												class="transition hover:underline"
											>
												<Item class="gap-2">
													<div slot="start">
														{#if !index}
															<svg
																class="w-5 h-5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																xmlns="http://www.w3.org/2000/svg"
																><path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
																/></svg
															>
														{:else}
															<svg
																class="w-5 h-5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
																xmlns="http://www.w3.org/2000/svg"
																><path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
																/></svg
															>
														{/if}
													</div>
													<div class="">{dir.name}</div>
												</Item>
											</button>
										</li>
									{/each}
									{#if file_dir}
										<svg
											class="w-4 h-4 opacity-70"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/></svg
										>
										<li transition:fade class="flex">
											<button type="button" class="transition hover:underline">
												<Item class="gap-2">
													<div slot="start">
														<svg
															class="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
															><path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
															/></svg
														>
													</div>
													<div class="">{file_dir.name}</div>
												</Item>
											</button>
										</li>
									{/if}
								</ul>
								<ul
									class="flex flex-col justify-items-center gap-2 px-6 py-3 bg-base-100 rounded-md"
								>
									{#each working_dir.subs as dir, index}
										{#if index}
											<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										{/if}
										<li transition:fade>
											<button
												on:click={() => {
													selected_dir = dir;
													file_dir = undefined;
												}}
												on:dblclick={() => {
													stack_dir.push(dir);
													stack_dir = stack_dir;
													working_dir = dir;
													file_dir = undefined;
													selected_dir = undefined;
												}}
												type="button"
												class="w-full"
											>
												<Item
													class="p-2 rounded-sm transition active:bg-secondary {selected_dir?.href ==
													dir.href
														? 'bg-primary'
														: 'hover:bg-base-200'}"
												>
													<svg
														slot="start"
														class="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
														/></svg
													>
													<div>{dir.name}</div>
												</Item>
											</button>
										</li>
									{/each}
									{#if working_dir.files.length && working_dir.subs.length}
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									{/if}
									{#each working_dir.files as file, index}
										{#if index}
											<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										{/if}
										<li transition:fade>
											<button
												on:click={() => {
													selected_dir = file;
													file_dir = file;
												}}
												type="button"
												class="w-full"
											>
												<Item
													class="p-2 rounded-sm transition active:bg-secondary {selected_dir?.href ==
													file.href
														? 'bg-primary'
														: 'hover:bg-base-200'}"
												>
													<svg
														slot="start"
														class="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
														/></svg
													>
													<div>{file.name}</div>
												</Item>
											</button>
										</li>
									{/each}
								</ul>
								<div class="flex items-center gap-4 px-6 py-3 bg-base-100 rounded-md">
									<button
										on:click={() => (show_modal = true)}
										type="button"
										class="btn btn-square bg-base-200"
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
												d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
											/></svg
										>
									</button>

									<button
										on:click={() => (show_modal = true)}
										type="button"
										class="btn btn-square bg-base-200"
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
												d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/></svg
										>
									</button>
									<button on:click={upload} type="button" class="btn btn-square bg-base-200">
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
												d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
											/></svg
										>
									</button>
									{#if selected_dir}
										<div />
										<button on:click={remove} type="button" class="btn btn-square bg-base-200">
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
													d="M9 13h6M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
												/></svg
											>
										</button>
										<button on:click={remove} type="button" class="btn btn-square bg-base-200">
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
													d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/></svg
											>
										</button>
										<button on:click={download} type="button" class="btn btn-square bg-base-200">
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
													d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
												/></svg
											>
										</button>
										<button on:click={() => {
											if (selected_dir) {
												window.navigator.clipboard.writeText(selected_dir.href);
											}
										}} type="button" class="btn btn-square bg-base-200">
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
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
												/></svg
											>
										</button>
									{/if}
									<div />
									<button on:click={init} type="button" class="btn btn-square bg-base-200">
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
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											/></svg
										>
									</button>
								</div>
							{:else}
								<div class="flex items-center gap-4 px-6 py-3 bg-base-100 rounded-md">
									<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
										&nbsp;
									</div>
								</div>
								<div class="flex items-center gap-4 px-6 py-3 bg-base-100 rounded-md">
									<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
										&nbsp;
									</div>
								</div>
								<div class="flex items-center gap-4 px-6 py-3 bg-base-100 rounded-md">
									<div class="px-1 py2 flex-grow bg-base-200 rounded min-h-12 animate-pulse">
										&nbsp;
									</div>
								</div>
							{/if}
						</div>
					</div>
				</form>
				<Modal
					bind:show={show_modal}
					class="flex flex-col gap-4 w-full text-base-content bg-base-100"
				>
					<form on:submit|preventDefault={create}>
						<div class="form-control">
							<label for="create" class="label">
								<span class="label-text">Create Folder or File</span>
							</label>
							<div class="flex gap-4">
								<input
									bind:value={new_dir_name}
									id="create"
									class="input input-ghost input-primary flex-grow bg-base-200"
								/>
								<button class="btn btn-square btn-primary">
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
						</div>
					</form>
				</Modal>
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
