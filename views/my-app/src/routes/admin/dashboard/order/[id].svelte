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
	import Menu from '$components/menu.svelte';
	import List from '$components/list.svelte';
	import ListItem from '$components/list-item.svelte';
	import Modal from '$components/modal.svelte';
	import Avatar from '$components/avatar.svelte';
	import AppbarContent from '../_appbar.svelte';
	import DrawerContent from '../_drawer.svelte';
	import FooterContent from '../_footer.svelte';

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { Currency, Diff, wait } from '$lib/helper';

	import type { ClientApi } from '$apis/index';
	import type { User } from '$lib/store';

	const title = 'Order';
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
	let order: ClientApi.Transaction & {
		created_by: ClientApi.User;
		related_by?: ClientApi.User;
	};
	let order_data: ClientApi.Transaction.TransactionData;
	let cleaners: ClientApi.User[] = [];
	let show_cleaner = false;
	// let order: ClientApi.Admin.OrderDetail;
	let couriers: ClientApi.Courier[] = [];
	let business: ClientApi.Admin.Data['business'];
	let delivery_proof: File | undefined;
	let copy: any = {};
	let contact: { name: string; nodeId: number }[] = [];
	let disable = true;
	let menu_chat = false;
	let menu_order_status = false;
	let menu_delivery_status = false;
	let statuses = [/* 'create', 'proccess',  */ 'finish', 'cancel'];
	let show_courier = false;

	$: diff(order);

	onMount(init);
	onDestroy(release);

	async function init() {
		try {
			await client.ready;
			order = await client.transaction.get({ id });
			order.created_on = (new Date(order.created_on).toISOString().slice(0, -4) + '000') as any;
			order.finished_on = order.finished_on
				? ((new Date(order.finished_on).toISOString().slice(0, -4) + '000') as any)
				: '';
			order_data = order.data as any;
			copy = Diff.objectCopy(order);
			contact = [
				{ name: 'Pelanggan', nodeId: order.created_by.chat_node_id ?? 0 },
				...(order.related_by
					? [{ name: 'Pembersih', nodeId: order.created_by.chat_node_id ?? 0 }]
					: [])
			];
			// business = await client.admin.getBusiness();
			// order = await client.admin.order(id);
			// order.createOn = new Date(order.createOn).toISOString().slice(0, -4) + '000' as any;
			// order.finishOn = order.finishOn
			// 	? (new Date(order.finishOn).toISOString().slice(0, -4) + '000' as any)
			// 	: '';
			// order.delivery.sentOn = order.delivery.sentOn
			// 	? (new Date(order.delivery.sentOn).toISOString().slice(0, -4) + '000' as any)
			// 	: '';
			// order.delivery.receiveOn = order.delivery.receiveOn
			// 	? (new Date(order.delivery.receiveOn).toISOString().slice(0, -4) + '000' as any)
			// 	: '';
			// copy = Diff.objectCopy(order);
			// contact = [
			// 	...(order.delivery.recipient.buyer
			// 		? [
			// 				{
			// 					name: 'Buyer',
			// 					nodeId: order.delivery.recipient.buyer.chatNodeId
			// 				}
			// 		  ]
			// 		: []),
			// 	{
			// 		name: 'Seller',
			// 		nodeId: order.delivery.sender.chatNodeId
			// 	},
			// 	...(order.delivery.courier
			// 		? [
			// 				{
			// 					name: 'Courier',
			// 					nodeId: order.delivery.courier.chatNodeId
			// 				}
			// 		  ]
			// 		: [])
			// ];
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
	async function diff(...tag: any) {
		if (order) {
			const changed = Diff.object(copy, order);

			console.log(order);
			console.log(changed);

			if (changed) {
				disable = false;
			} else {
				disable = true;
			}
		}
	}
	async function save() {
		try {
			progress.showing();
			disable = true;

			if (!order) throw new Error('');

			const changed = Diff.object(copy, order);

			console.log(order);
			console.log(changed);

			if (changed) {
				if (changed.related_by_user) {
					await client.transaction.assign({
						id: order.id,
						related_by: order.related_by_user as any
					});
				}
				if (changed.status) {
					if (order.status == 'create') {
					} else if (order.status == 'proccess') {
					} else if (order.status == 'finish') {
						await client.transaction.finish({ id: order.id });
					} else if (order.status == 'cancel') {
						await client.transaction.cancel({ id: order.id });
					}
				}
				await init();
			}
			// if (changed) {
			// 	if (typeof changed.createOn == 'string') {
			// 		changed.createOn = changed.createOn ? new Date(changed.createOn) : null;
			// 	}
			// 	if (typeof changed.finishOn == 'string') {
			// 		changed.finishOn = changed.finishOn ? new Date(changed.finishOn) : null;
			// 	}
			// 	if (changed.delivery) {
			// 		const temp = changed.delivery;
			// 		if (typeof changed.delivery.sentOn == 'string') {
			// 			changed.delivery.sentOn = changed.delivery.sentOn
			// 				? new Date(changed.delivery.sentOn)
			// 				: null;
			// 		}
			// 		if (typeof changed.delivery.receiveOn == 'string') {
			// 			changed.delivery.receiveOn = changed.delivery.receiveOn
			// 				? new Date(changed.delivery.receiveOn)
			// 				: null;
			// 		}
			// 		if (changed.delivery.courier) {
			// 			changed.delivery.courier = undefined;
			// 		}
			// 		if (changed.delivery.proofImage && delivery_proof) {
			// 			temp.proofImage = await client.delivery.uploadImage(
			// 				`${order.deliveryId}/${delivery_proof.name}`,
			// 				delivery_proof
			// 			);
			// 		}
			// 		changed.delivery = {
			// 			update: temp
			// 		};
			// 	}
			// 	const result = await client.order.update({
			// 		where: { id },
			// 		data: changed
			// 	});
			// 	Diff.objectAssign(copy, order);
			// }
		} catch (error: any) {
			disable = false;
		} finally {
			progress.hiding();
		}
	}
	async function get_cleaner() {
		try {
			show_cleaner = true;

			cleaners = await client.user.searchMany({
				where: {
					role: 'cleaner'
				}
			});
		} catch (error: any) {
			show_cleaner = false;
		} finally {
		}
	}
	async function getCourier() {
		try {
			show_courier = true;

			couriers = await client.courier.searchMany({
				where: {
					AND: [{ contracted: false }, { address: { not: null } }]
				}
			});
		} catch (error: any) {
			show_courier = false;
		} finally {
		}
	}
	// function inputFile(this: HTMLInputElement) {
	// 	if (this.files) {
	// 		delivery_proof = this.files[0];
	// 		order.delivery.proofImage = URL.createObjectURL(delivery_proof);
	// 		order = order;
	// 	}
	// }
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<Page {mode} class="bg-neutral text-neutral-content">
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
					{#if order}
						<div class="grid gap-12 w-[500px] justify-self-center">
							<div class="grid gap-4">
								<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Order</div>
										<div class="flex-grow" />
										<button
											id="order-status"
											type="button"
											on:click={() => (menu_order_status = !menu_order_status)}
											class="btn btn-xs bg-base-100">{order.status}</button
										>
										<Menu
											for="order-status"
											bind:show={menu_order_status}
											bind:value={order.status}
											class="bg-base-300"
										>
											{#each statuses as status}
												<ListItem value={status}>
													<button
														type="button"
														class="w-full p-3 {status == order.status
															? 'bg-primary'
															: 'hover:bg-gray-400 dark:hover:bg-gray-500'}"
													>
														{status}
													</button>
												</ListItem>
											{/each}
										</Menu>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">#ID</div>
										<div class="flex-grow" />
										<div class="text-sm">{order.id}</div>
									</div>
									<div class="flex items-center">
										<label for="order-createat" class="text-sm flex-[50%]">Create at</label>
										<input
											id="order-createat"
											type="datetime-local"
											step="1"
											bind:value={order.created_on}
											class="input input-sm flex-[50%]"
										/>
										<button />
									</div>
									<div class="flex items-center">
										<label for="order-finishat" class="text-sm flex-[50%]">Finish at</label>
										<input
											id="order-finishat"
											type="datetime-local"
											step="1"
											bind:value={order.finished_on}
											class="input input-sm flex-[50%]"
										/>
										<button />
									</div>
									<!-- <div class="flex items-center">
										<label for="order-confirmed" class="text-sm">Confirmed</label>
										<div class="flex-grow" />
										<input
											id="order-confirmed"
											type="checkbox"
											bind:checked={order.confirmed}
											class="toggle toggle-primary"
										/>
									</div> -->
								</section>
								<!-- <section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Delivery</div>
										<div class="flex-grow" />
										<button
											id="delivery-status"
											type="button"
											on:click={() => (menu_delivery_status = !menu_delivery_status)}
											class="btn btn-xs bg-base-100">{order.delivery.status}</button
										>
										<Menu
											for="delivery-status"
											bind:show={menu_delivery_status}
											bind:value={order.delivery.status}
											class="bg-base-300"
										>
											{#each statuses as status}
												<ListItem value={status}>
													<button
														type="button"
														class="w-full p-3 {status == order.delivery.status
															? 'bg-primary'
															: 'hover:bg-gray-400 dark:hover:bg-gray-500'}"
													>
														{status}
													</button>
												</ListItem>
											{/each}
										</Menu>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">#ID</div>
										<div class="flex-grow" />
										<div class="text-sm">{order.delivery.id}</div>
									</div>
									<div class="flex items-center">
										<label for="order-sentat" class="text-sm flex-[50%]">Sent at</label>
										<input
											id="order-sentat"
											type="datetime-local"
											step="1"
											bind:value={order.delivery.sentOn}
											class="input input-sm flex-[50%]"
										/>
										<button />
									</div>
									<div class="flex items-center">
										<label for="order-receiverat" class="text-sm flex-[50%]">Receive at</label>
										<input
											id="order-receiverat"
											type="datetime-local"
											step="1"
											bind:value={order.delivery.receiveOn}
											class="input input-sm flex-[50%]"
										/>
										<button />
									</div>
									<div class="flex items-center">
										<label for="order-delivery-confirmed" class="text-sm">Confirmed</label>
										<div class="flex-grow" />
										<input
											id="order-delivery-confirmed"
											type="checkbox"
											bind:checked={order.delivery.confirmed}
											class="toggle toggle-primary"
										/>
									</div>
								</section> -->
								<!-- <section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Recipient</div>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">Name</div>
										<div class="flex-grow" />
										<div class="text-sm">
											{order.delivery.recipient.name}
										</div>
									</div>
									<div class="flex">
										<div class="text-sm">Telp</div>
										<div class="flex-grow" />
										<div class="text-sm">
											{order.delivery.recipient.telp}
										</div>
									</div>
									<div class="flex">
										<div class="flex-[50%] text-sm">Address</div>
										<div class="flex-[50%] text-sm text-right">
											{order.delivery.recipient.value}
										</div>
									</div>
								</section> -->
								<!-- <section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Sender</div>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">Name</div>
										<div class="flex-grow" />
										<div class="text-sm">
											{order.delivery.sender.name}
										</div>
									</div>
									<div class="flex">
										<div class="text-sm">Telp</div>
										<div class="flex-grow" />
										<div class="text-sm">
											{order.delivery.sender.telp}
										</div>
									</div>
									<div class="flex">
										<div class="flex-[50%] text-sm">Address</div>
										<div class="flex-[50%] text-sm text-right">
											{order.delivery.sender.address}
										</div>
									</div>
								</section> -->
								<!-- {#if order.delivery.courier}
									<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
										<div class="flex">
											<div class="text-base font-semibold">Courier</div>
											<div class="flex-grow" />
											<button
												type="button"
												on:click={() => {
													order.delivery.courier = null;
													order.delivery.courierId = null;
													order = order;
												}}
												class="btn btn-xs btn-square bg-base-100"
											>
												<svg
													class="w-4 h-4"
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
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										<div class="flex">
											<div class="text-sm">Name</div>
											<div class="flex-grow" />
											<div class="text-sm">
												{order.delivery.courier.name}
											</div>
										</div>
										<div class="flex">
											<div class="text-sm">Telp</div>
											<div class="flex-grow" />
											<div class="text-sm">
												{order.delivery.courier.telp}
											</div>
										</div>
										<div class="flex">
											<div class="flex-[50%] text-sm">Address</div>
											<div class="flex-[50%] text-sm text-right">
												{order.delivery.courier.address}
											</div>
										</div>
										<div class="flex gap-4">
											<div class="flex-[50%] flex justify-between text-sm">
												<div>Proof</div>
												<button
													type="button"
													on:click={() => {
														order.delivery.proofImage = null;
														order = order;
													}}
													class="btn btn-xs btn-square bg-base-100"
												>
													<svg
														class="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														><path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/></svg
													>
												</button>
											</div>
											<div class="flex-[50%] text-sm flex justify-center">
												{#if order.delivery.proofImage}
													<img
														src={order.delivery.proofImage}
														alt="Proof Payment"
														class="object-cover object-center"
													/>
												{:else}
													<div
														class="relative bg-base-100 rounded-md hover:ring-2 hover:ring-primary hover:ring-offset-2 ring-offset-base-300"
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
												{/if}
											</div>
										</div>
									</section>
								{:else}
									<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
										<div class="flex">
											<div class="text-base font-semibold">Courier</div>
										</div>
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										<button type="button" on:click={getCourier} class="btn btn-sm btn-primary"
											>Select Courier</button
										>
									</section>
								{/if} -->
								<!-- <section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Item</div>
									</div>
									{#each order.item as item}
										<div class="flex gap-4 p-2 border border-black/10 dark:border-white/10 rounded">
											<img
												src={item.product.image}
												alt={item.product.name}
												width="44"
												height="44"
												class="aspect-1 rounded"
											/>
											<div class="flex flex-col justify-between">
												<div class="text-sm font-semibold">{item.product.name}</div>
												<div class="text-sm">
													{item.amount} x Rp. {Currency.toMoney(item.price + '')}
												</div>
											</div>
										</div>
									{/each}
								</section> -->
								<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Customer</div>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">Name</div>
										<div class="flex-grow" />
										<div class="text-sm">{order.created_by.name}</div>
									</div>
									<div class="flex">
										<div class="flex-[50%] text-sm">Address</div>
										<div class="flex-[50%] text-sm text-right">
											<div class="text-sm">{order_data.address.name}</div>
										</div>
									</div>
									<div class="flex">
										<div class="text-sm">Time</div>
										<div class="flex-grow" />
										<div class="text-sm">{order_data.datetime.name}</div>
									</div>
								</section>
								{#if order.related_by}
									<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
										<div class="flex">
											<div class="text-base font-semibold">Cleaner</div>
										</div>
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										<div class="flex">
											<div class="text-sm">Name</div>
											<div class="flex-grow" />
											<div class="text-sm">{order.related_by.name}</div>
										</div>
										<!-- <div class="flex">
											<div class="flex-[50%] text-sm">Address</div>
											<div class="flex-[50%] text-sm text-right">
												<div class="text-sm">{order.related_by.address ?? '----'}</div>
											</div>
										</div> -->
									</section>
								{:else}
									<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
										<div class="flex">
											<div class="text-base font-semibold">Cleaner</div>
										</div>
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										<button type="button" on:click={get_cleaner} class="btn btn-sm btn-primary"
											>Select Cleaner</button
										>
									</section>
								{/if}
								<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex">
										<div class="text-base font-semibold">Payment Detail</div>
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm">Payment Method</div>
										<div class="flex-grow" />
										<div class="text-sm">{order_data.payment_method.name}</div>
									</div>
									<div class="flex">
										<div class="text-sm">Total Price ({order_data.services.length} item)</div>
										<div class="flex-grow" />
										<div class="text-sm">
											Rp. {Currency.toMoney(order.cost + '')}
										</div>
									</div>
									<!-- <div class="flex">
										<div class="text-sm">
											Total Shipping Cost ({(order.delivery.range / 1000).toFixed(3)} km)
										</div>
										<div class="flex-grow" />
										<div class="text-sm">
											Rp. {Currency.toMoney(order.delivery.cost + '')}
										</div>
									</div> -->
									<!-- <div class="flex">
										<div class="text-sm">Admin Cost</div>
										<div class="flex-grow" />
										<div
											class="text-sm {business.productPriceIncreaseActive ? '' : 'line-through'}"
										>
											Rp. {Currency.toMoney(business.productPriceIncrease)}
										</div>
									</div> -->
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex">
										<div class="text-sm font-semibold">Total Pay</div>
										<div class="flex-grow" />
										<div class="text-sm font-semibold">
											Rp. {Currency.toMoney(+order.cost)}
										</div>
									</div>
								</section>
							</div>
							<div class="flex gap-2">
								<button
									id="chat"
									type="button"
									on:click={() => (menu_chat = !menu_chat)}
									class="btn btn-square border-0 bg-base-200"
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
											d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
										/></svg
									>
								</button>
								<Menu for="chat" bind:show={menu_chat} class="bg-base-300">
									{#each contact as contact}
										<ListItem>
											<button
												type="button"
												on:click={() => {
													if (contact.nodeId) {
														goto('/admin/chat?connect_with=' + contact.nodeId);
													}
												}}
												class="w-full p-3 hover:bg-gray-400 dark:hover:bg-gray-500"
												>{contact.name}</button
											>
										</ListItem>
									{/each}
								</Menu>
								<button
									disabled={disable}
									class="btn btn-primary flex-grow {disable ? 'btn-disabled' : ''}"
								>
									Update
								</button>
							</div>
						</div>
					{:else}
						<div class="grid gap-12 w-[500px] justify-self-center">
							<div class="grid gap-4">
								<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
								</section>
								<section class="flex flex-col gap-2 p-4 bg-base-200 rounded-md">
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
									<div class="flex gap-4">
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
										<div class="flex-[50%] min-h-6 bg-base-300 animate-pulse" />
									</div>
								</section>
							</div>
							<button
								type="submit"
								disabled={disable}
								class="btn btn-primary {disable ? 'btn-disabled' : ''}">Save</button
							>
						</div>
					{/if}
				</form>
				<Modal
					bind:show={show_cleaner}
					class="flex flex-col gap-4 w-[500px] text-base-content bg-base-200"
				>
					<div class="px-3">Select Cleaner</div>
					<List class="gap-2">
						{#each cleaners as cleaner}
							<ListItem>
								<button
									on:click={() => {
										order.related_by = cleaner;
										order.related_by_user = cleaner.id;
										order = order;
									}}
									class="p-3 w-full rounded-sm {cleaner.id == order.related_by?.id
										? 'bg-primary'
										: 'hover:bg-base-300'}"
								>
									<Avatar
										account={{
											image: cleaner.image,
											title: cleaner.name ?? '---',
											subtitle: cleaner.address ?? '---'
										}}
									/>
								</button>
							</ListItem>
						{/each}
					</List>
					<!-- <div class="px-3">Select Courier</div>
					<List class="gap-2">
						{#each couriers as courier}
							<ListItem>
								<button
									on:click={() => {
										order.delivery.courier = courier;
										order.delivery.courierId = courier.id;
										order = order;
									}}
									class="p-3 rounded-sm {courier.id == order.delivery.courier?.id
										? 'bg-primary'
										: 'hover:bg-base-300'}"
								>
									<Avatar
										account={{
											image: courier.image,
											title: courier.name ?? '---',
											subtitle: courier.address ?? '---'
										}}
									/>
								</button>
							</ListItem>
						{/each}
					</List> -->
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
	.aspect-1 {
		aspect-ratio: 1;
	}
</style>
