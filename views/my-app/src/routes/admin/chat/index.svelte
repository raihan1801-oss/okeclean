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

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { ClientApi, User } from '../__layout.svelte';

	const title = 'Chat';
	const desc = '';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');
	const ws = client.chat.ws_v2;

	let mode = 'dark';
	let drawerOpened = true;
	let account = { image: '', name: '', role: '' };
	let user_login = $user;
	let connect_with = $page.query.get('connect_with');
	let progress: Progress;

	let messages_container: HTMLElement;
	let channels: ClientApi.Chat.Channel[] = [];
	let selected_channel_id = 0;
	let selected_channel_index = -1;
	let text = '';
	let image = '';
	let disable = true;

	$: selected_channel_id && messages_container && scrollBottom();

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
				name: user_login.username,
				role: user_login.role
			};

			connect_with &&
				(await client.chat.connectContact({
					myId: user_login.chatNodeId,
					theirId: +connect_with
				}));

			channels = await client.chat.getChannels({ nodeId: user_login.chatNodeId });

			await ws.open();
			ws.send('connect', { nodeId: user_login.chatNodeId, channel: channels })
				.receive('join', (data) => {
					channels.push(data);
					channels = channels;
				})
				.receive('message', (data) => {
					channels.find((channel) => channel.id == data.channelId)?.message.push(data);
					channels = channels;
					if (document.visibilityState == 'hidden' && Notification.permission == 'granted') {
						const notification = new Notification(data.sender.name, {
							body: data.text,
							badge: "logo.png",
							icon: "logo.png",
							tag: data.channelId + '',
							renotify: true
						});
						notification.addEventListener('click', (event) => {
							window.focus();
						});
					}
					setTimeout(scrollBottom);
				});

			disable = false;
			Notification.requestPermission();
		} catch (error: any) {
			console.error(error);
		} finally {
			progress.hiding();
		}
	}
	async function release() {
		try {
			ws.close();
		} catch (error: any) {
			console.error(error);
		} finally {
		}
	}
	async function send() {
		try {
			progress.showing();
			disable = true;
			if (!user_login) {
				throw new Error();
			}
			await client.chat.message({
				data: {
					text,
					channelId: selected_channel_id,
					senderId: user_login.chatNodeId
				}
			});
			text = '';
		} catch (error: any) {
			console.error(error);
		} finally {
			disable = false;
			progress.hiding();
		}
	}
	function scrollBottom() {
		messages_container.scrollTo({
			behavior: 'smooth',
			top: messages_container.scrollHeight
		});
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
		<Content class="flex-grow h-screen overflow-y-auto">
			<Appbar class="bg-base-100">
				<AppbarContent bind:account bind:mode bind:drawerOpened />
			</Appbar>
			<Progress bind:this={progress} />
			<Main class="flex-grow overflow-y-auto">
				<section>
					<div class="text-2xl font-bold">{title}</div>
				</section>
				<section class="chatlayout flex-grow">
					<aside class="chatnode">
						<ul class="list">
							{#each channels as channel, index}
								{#if index}
									<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
								{/if}
								<li>
									<button
										on:click={() => {
											selected_channel_index = index;
											selected_channel_id = channel.id;
										}}
										class="item {channel.id == selected_channel_id ? 'active' : ''}"
									>
										<img src={channel.image} alt="" />
										<div>{channel.name}</div>
									</button>
								</li>
							{/each}
						</ul>
					</aside>
					<section class="chatbox">
						{#if channels[selected_channel_index]}
							<section class="topbar">
								<img src={channels[selected_channel_index].image} alt="" />
								<div class="text-base">{channels[selected_channel_index].name}</div>
							</section>
							<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
							<section bind:this={messages_container} class="messages">
								{#each channels[selected_channel_index].message as message}
									<div
										transition:scale
										class="message {message.sender.id == $user?.chatNodeId ? 'mymessage' : ''}"
									>
										<div class="info">
											<div class="">{message.sender.name}</div>
											<div class="flex-grow" />
											<div class="">{new Date(message.sentAt).toLocaleString()}</div>
											<div class="">
												<button
													disabled={disable}
													class="btn btn-ghost btn-xs btn-square {disable ? 'btn-disabled' : ''}"
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
															d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
														/></svg
													>
												</button>
											</div>
										</div>
										<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
										<div class="content">{message.text}</div>
									</div>
								{/each}
							</section>
							<hr class="h-[1px] border-0 opacity-10 bg-black dark:bg-white" />
							<form autocomplete="off" on:submit|preventDefault={send} class="bottombar">
								<div class="form-control">
									<label class="relative w-full">
										<input
											bind:value={text}
											type="text"
											placeholder="Write message..."
											disabled={disable}
											class="input input-md w-full rounded-md {disable
												? 'input-disabled'
												: 'input-primary'}"
										/>
										<div
											class="absolute top-0 right-0 grid place-content-center h-full"
											style="aspect-ratio: 1;"
										>
											<button
												type="submit"
												disabled={disable}
												class="btn btn-sm btn-square btn-ghost {disable
													? 'btn-disabled'
													: 'hover:bg-base-100'}"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													class="w-6 h-6 fill-current"
													><path
														d="M20.34,9.32l-14-7a3,3,0,0,0-4.08,3.9l2.4,5.37h0a1.06,1.06,0,0,1,0,.82l-2.4,5.37A3,3,0,0,0,5,22a3.14,3.14,0,0,0,1.35-.32l14-7a3,3,0,0,0,0-5.36Zm-.89,3.57-14,7a1,1,0,0,1-1.35-1.3l2.39-5.37A2,2,0,0,0,6.57,13h6.89a1,1,0,0,0,0-2H6.57a2,2,0,0,0-.08-.22L4.1,5.41a1,1,0,0,1,1.35-1.3l14,7a1,1,0,0,1,0,1.78Z"
													/></svg
												>
											</button>
										</div>
									</label>
								</div>
							</form>
						{/if}
					</section>
				</section>
			</Main>
			<Footer class="bg-base-100 justify-center">
				<FooterContent />
			</Footer>
		</Content>
	</section>
</Page>

<style lang="scss">
	.chatlayout {
		overflow-y: auto;
		display: grid;
		grid-template-columns: 3fr 9fr;
		gap: 16px;
	}
	.chatnode {
		@apply bg-base-100;
		@apply rounded-md;
		padding: 4px 0;
		.list {
			display: grid;
		}
		.item {
			width: stretch;
			padding: 8px 16px;
			display: flex;
			gap: 8px;
			align-items: center;
			border-radius: 2px;
			&:hover {
				@apply bg-base-200;
			}
			img {
				height: 32px;
				aspect-ratio: 1;
				border-radius: 6px;
			}
			&.active {
				@apply bg-primary;
			}
		}
	}
	.chatbox {
		overflow-y: auto;
		display: grid;
		grid-template-rows: max-content 1px auto 1px max-content;
		@apply bg-base-100;
		@apply rounded-md;
		.topbar {
			padding: 12px 18px;
			display: flex;
			gap: 16px;
			align-items: center;
			img {
				height: 32px;
				aspect-ratio: 1;
				border-radius: 6px;
			}
		}
		.messages {
			overflow-y: auto;
			padding: 12px 16px;
			display: grid;
			align-content: start;
			gap: 16px;
			scroll-behavior: smooth;
			.message {
				@apply bg-base-200;
				width: fit-content;
				max-width: 80%;
				border-radius: 8px 8px 8px 2px;
				overflow-wrap: anywhere;
			}
			.mymessage {
				@apply bg-primary;
				justify-self: end;
				border-radius: 8px 8px 2px 8px;
			}
			.info {
				@apply text-sm;
				display: flex;
				gap: 8px;
				padding: 4px 12px;
				.name {
					@apply opacity-70;
				}
			}
			.content {
				@apply text-base;
				padding: 8px 12px;
			}
		}
		.bottombar {
			padding: 12px 18px;
		}
	}
</style>
