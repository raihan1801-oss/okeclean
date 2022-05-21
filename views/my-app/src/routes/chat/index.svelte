<script context="module" lang="ts">
	import { MaterialAppMin, Button, Icon, Divider, TextField } from 'svelte-materialify/src';
	import { mdiMagnify, mdiChevronLeft, mdiSendOutline, mdiAccountOutline } from '@mdi/js';
	import Snackbar from '$components/snackbar.svelte';
	import Appbar from '../_appbar.svelte';
	import ProgressLinear from '$components/progress-linear.svelte';

	import { onMount, onDestroy, getContext } from 'svelte';
	import { slide, scale } from 'svelte/transition';

	import { page } from '$app/stores';

	import type { ObserverUnsafe } from '$lib/helper';
	import type { BuyerClient } from '../__layout.svelte';
</script>

<script lang="ts">
	const client = getContext<BuyerClient>('buyer');
	const is_desktop = getContext<ObserverUnsafe<boolean>>('is_desktop');
	// const wsclient = client.api.chat.ws();
	const ws = client.api.chat.ws_v2;
	let user_login: BuyerClient.User;
	// let user_login: BuyerClient.User;
	let snackbar: Snackbar;
	let current_channel: BuyerClient.Chat.Contact | undefined;
	let channels: BuyerClient.Chat.Contact[] = [];
	let findContacts: BuyerClient.Chat.Contact[] = [];
	let fakeContact = Array(4);
	let connectTo = $page.url.searchParams.get('connectTo');
	let progress: ProgressLinear;
	let searchText = '';
	let messageText = '';
	let disable_send = true;
	let content: HTMLElement;
	let width = 0;
	let screen: 'desktop' | 'mobile' = 'mobile';

	$: loading = progress?.active;
	$: current_channel && content && scrollBottom();
	$: searchText && search();
	$: {
		if (width > 600) {
			screen = 'desktop';
		} else {
			screen = 'mobile';
		}
	}

	onMount(init);
	onDestroy(release);
	async function init() {
		try {
			await client.ready;
			user_login = await client.api.user.auth();
			// buyer = await client.api.user.auth();

			if (!user_login.chat_node_id) {
				const contact = await client.api.chat.createContact({
					id: user_login.id,
					name: user_login.name,
					image: user_login.image,
					role: user_login.role,
					type: 'per'
				});
				user_login.chat_node_id = contact.id;
			}

			connectTo &&
				(await client.api.chat.connectContact({
					myId: user_login.chat_node_id,
					theirId: +connectTo
				}));

			channels = await client.api.chat.getChannels({ nodeId: user_login.chat_node_id });

			console.log(channels);

			fakeContact = Array(0);

			await ws.open();
			ws.send('connect', { nodeId: user_login.chat_node_id, channel: channels })
				.receive('join', (data) => {
					channels.push(data);
					channels = channels;
				})
				.receive('message', (data) => {
					for (const channel of channels) {
						if (channel.id == data.channelId) {
							channel.message.push(data);
							if (current_channel?.id == channel.id) {
								current_channel = current_channel;
							}
							break;
						}
					}
					channels = channels;
					if (document.visibilityState == 'hidden' && Notification.permission == 'granted') {
						const notification = new Notification(data.sender.name, {
							body: data.text,
							badge: '/logo.png',
							icon: '/logo.png',
							tag: data.channelId + '',
							renotify: true
						});
						notification.addEventListener('click', (event) => {
							window.focus();
						});
					}
					setTimeout(scrollBottom);
				});

			disable_send = false;
			Notification.requestPermission();
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
		} finally {
			disable_send = false;
			progress.loaded();
		}
	}
	async function release() {
		disable_send = true;
		ws.close();
	}
	async function search() {
		let regex = new RegExp(searchText, 'ig');
		findContacts = channels.filter((contact) => regex.test(contact.name));
	}
	async function send() {
		try {
			progress.loading();
			disable_send = true;
			if (!current_channel) {
				throw new Error('Kontak tidak ditemukan');
			}
			if (!user_login.chat_node_id) {
				throw new Error('Kontak tidak ditemukan');
			}
			await client.api.chat.message({
				data: {
					channelId: current_channel.id,
					senderId: user_login.chat_node_id,
					text: messageText
				}
			});
			messageText = '';
		} catch (error: any) {
			snackbar.setText(error.message);
			snackbar.show();
		} finally {
			disable_send = false;
			progress.loaded();
		}
	}
	function scrollBottom() {
		content.scrollTo({
			behavior: 'smooth',
			top: content.scrollHeight
		});
	}
	// function scrollContent() {
	// 	setTimeout(() => {
	// 		content.scroll({
	// 			behavior: 'smooth',
	// 			top: content.scrollHeight
	// 		});
	// 	});
	// }
</script>

<svelte:head>
	<title>Pesan</title>
	<meta name="" content="" />
</svelte:head>

<div bind:clientWidth={width} transition:slide>
	<MaterialAppMin>
		<ProgressLinear
			bind:this={progress}
			backgroundColor="secondary-color"
			color="secondary-color"
		/>
		<Appbar loading={$loading} desktop={$is_desktop} title={$is_desktop ? '' : 'Pesan'} back_nav />
		<main class={screen}>
			<section class="card {screen == 'mobile' && current_channel ? 'hide' : ''}">
				<form autocomplete="off" on:submit|preventDefault={search} class="search">
					<TextField outlined dense placeholder="Cari..." bind:value={searchText}>
						<div slot="prepend">
							<Button fab icon text size="small" on:click={() => {}}>
								<Icon class="grey-text text-darken-3" path={mdiMagnify} />
							</Button>
						</div>
					</TextField>
				</form>
				<ul class="list">
					{#if searchText}
						{#each findContacts as item}
							<li
								class="item {item.id == current_channel?.id ? 'primary-color' : ''}"
								on:click={() => {
									current_channel = item;
								}}
							>
								{#if item.image}
									<img class="thumb" src={item.image} alt="" />
								{:else}
									<div class="thumb">
										<Icon class="grey-text text-darken-3" path={mdiAccountOutline} />
									</div>
								{/if}
								<div class="">{item.name}</div>
							</li>
						{/each}
					{:else}
						{#each channels as item}
							<li
								class="item {item.id == current_channel?.id ? 'primary-color' : ''}"
								on:click={() => {
									current_channel = item;
								}}
							>
								{#if item.image}
									<img class="thumb" src={item.image} alt="" />
								{:else}
									<div class="thumb">
										<Icon class="grey-text text-darken-3" path={mdiAccountOutline} />
									</div>
								{/if}
								<div class="">{item.name}</div>
							</li>
						{/each}
					{/if}
					{#each fakeContact as any}
						<li class="item">
							<div class="thumb loading">&nbsp;</div>
							<div class="w-full loading">&nbsp;</div>
						</li>
					{/each}
				</ul>
			</section>
			<section class="card message {screen == 'mobile' && !current_channel ? 'hide' : ''}">
				{#if current_channel}
					<section class="topbar">
						{#if screen == 'mobile'}
							<Button fab icon text size="small" on:click={() => (current_channel = undefined)}>
								<Icon path={mdiChevronLeft} />
							</Button>
						{/if}
						{#if current_channel.name}
							<img class="thumb" src={current_channel.image} alt="" />
						{:else}
							<Icon class="grey-text text-darken-3" path={mdiAccountOutline} />
						{/if}
						<div>{current_channel.name}</div>
					</section>
					<Divider />
					<section bind:this={content} class="content">
						{#each current_channel.message as message}
							{#if message.sender.id == user_login.chat_node_id}
								<section transition:scale class="item right primary-color">
									<div>{message.text}</div>
								</section>
							{:else}
								<section transition:scale class="item">
									<div>{message.text}</div>
								</section>
							{/if}
						{/each}
					</section>
					<Divider />
					<form autocomplete="off" on:submit|preventDefault={send} class="bottombar">
						<TextField outlined dense placeholder="Ketik sesuatu..." bind:value={messageText}>
							<div slot="append">
								<Button fab icon text size="small" type="submit" disabled={disable_send}>
									<Icon class="grey-text text-darken-3" path={mdiSendOutline} />
								</Button>
							</div>
						</TextField>
					</form>
				{/if}
			</section>
		</main>
		<Snackbar bind:this={snackbar} />
	</MaterialAppMin>
</div>

<style lang="scss">
	@import '../../components/common';
	@import '../../components/skeleton';
	@import '../../components/elevation';
	.loading {
		@include loading-sekeleton;
	}
	.card {
		@include elevation;
		border-radius: 6px;
		background-color: white;
	}
	.thumb {
		@include image;
		width: 32px;
	}
	main {
		padding: 24px 16px;
		display: grid;
		gap: 16px;
		overflow-y: auto;
		@include main;
	}
	.desktop {
		grid-template-columns: 4fr 8fr;
	}
	.hide {
		display: none !important;
	}
	ul {
		list-style: none;
		padding-left: 0;
	}
	.search {
		margin: 12px 16px;
	}
	.list {
		display: grid;
		gap: 8px;
		padding: 8px;
		.item {
			display: flex;
			gap: 16px;
			align-items: center;
			padding: 12px 16px;
			border: 1px solid #00000032;
			border-radius: 6px;
			&:hover {
				background-color: #0000000c;
			}
		}
	}
	.desktop .message {
		.content {
			display: grid;
			align-content: start;
			.item {
				&.right {
					justify-self: end;
				}
			}
		}
		.topbar {
			gap: 24px;
		}
	}
	.message {
		display: grid;
		grid-template-rows: max-content max-content auto max-content max-content;
		overflow-y: auto;
		.topbar {
			display: flex;
			align-items: center;
			padding: 12px 16px;
			gap: 8px;
		}
		.content {
			display: flex;
			flex-flow: column nowrap;
			padding: 12px 16px;
			gap: 16px;
			overflow-y: auto;
			.item {
				width: max-content;
				max-width: 70%;
				padding: 8px 12px;
				border: 1px solid #00000032;
				border-radius: 10px 10px 10px 2px;
				&.right {
					align-self: flex-end;
					border-radius: 10px 10px 2px 10px;
				}
				&:hover {
					background-color: #0000000c;
				}
			}
		}
		.bottombar {
			display: flex;
			gap: 16px;
			align-items: center;
			padding: 12px 16px;
		}
	}
	.w-full {
		width: 100%;
	}
	* :global {
		@include common-app {
			height: 100vh;
			overflow-y: auto;
		}
		@include common-loader;
		@include common-footer;
		.s-input {
			label {
				opacity: 0;
			}
		}
	}
</style>
