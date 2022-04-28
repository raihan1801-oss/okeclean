<script context="module" lang="ts">
	import { onMount, getContext } from 'svelte';
	import { slide, scale } from 'svelte/transition';

	import SideBar from '../../_side-bar.svelte';
	import AppBar from '../../_app-bar.svelte';
	import Main from '../../_main.svelte';
	import Footer from '../../_footer.svelte';
	import Progress from '$components/progress.svelte';

	import { Diff } from '$lib/helper';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	import type { ClientApi, User } from '../../__layout.svelte';

	const title = 'Chat';
	const desc = 'Chat';
</script>

<script lang="ts">
	const client = getContext<ClientApi>('clientApi');
	const user = getContext<User>('user');

	let loader: Progress;
	let messagesContainer: HTMLElement;
	let mode: 'light' | 'dark' = 'dark';
	let profile = { image: '', name: '', role: '' };
	let channels: ClientApi.Chat.Channel[] = [];
	let selectedChannel = 0;
	let selectedChannelIndex = -1;
	let text = '';
	let image = '';
	let unsubscribers: Function[] = [];
	let disable = true;

	$: selectedChannel && messagesContainer && scrollBottom();

	onMount(async () => {
		try {
			await client.ready;
			if (!$user) {
				return goto(base + '/');
			}
			channels = await client.chat.getChannels({ nodeId: $user.chatNodeId });

			const ws = client.chat.ws();

			ws.connect({ id: $user.chatNodeId, channel: channels });

			unsubscribers.push(
				await ws.onJoin((channel) => {
					channels.push(channel);
					channels = channels;
				})
			);
			unsubscribers.push(
				await ws.onMessage((message) => {
					channels.find((channel) => channel.id == message.channelId)?.message.push(message);
					channels = channels;
					if (document.visibilityState == 'hidden' && Notification.permission == 'granted') {
						const notification = new Notification(message.sentBy.name, {
							body: message.text,
							badge: message.sentBy.image,
							icon: message.sentBy.image,
							tag: message.channelId + '',
							renotify: true
						});
						notification.addEventListener('click', (event) => {
							window.focus();
						});
					}
					setTimeout(scrollBottom);
				})
			);
			unsubscribers.push(
				await ws.onClose(() => {
					goto(base + '/');
				})
			);

			profile = {
				image: $user?.image as any,
				name: $user?.username as any,
				role: $user?.role as any
			};
			Notification.requestPermission();
		} catch (error: any) {
			console.error(error);
		} finally {
			disable = false;
			loader.hiding();
		}
	});

	async function send() {
		try {
			loader.showing();
			disable = true;
			if (!$user) {
				throw new Error();
			}
			await client.chat.message({
				data: {
					sentAt: new Date(),
					text,
					channelId: selectedChannel,
					sentById: $user.chatNodeId
				}
			});
			text = '';
		} catch (error: any) {
		} finally {
			disable = false;
			loader.hiding();
		}
	}
	function scrollBottom() {
		messagesContainer.scrollTo({
			behavior: 'smooth',
			top: messagesContainer.scrollHeight
		});
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<section
	transition:slide
	data-theme={mode}
	class="{mode} grid grid-flow-col grid-cols-[2.5fr,9.5fr] bg-base-100 text-base-content"
>
	<SideBar />
	<section class="flex flex-col h-screen overflow-y-auto">
		<AppBar bind:mode account={profile} />
		<Progress bind:this={loader} />
		<Main class="flex-grow flex flex-col gap-6 overflow-y-auto">
			<section>
				<div class="text-3xl text-base-content font-bold">{title}</div>
			</section>
			<section class="chatlayout flex-grow">
				<aside class="chatnode">
					<ul class="list">
						{#each channels as channel, index}
							{#if index}
								<hr class="h-[1px] border-0 bg-white/10" />
							{/if}
							<li
								on:click={() => {
									selectedChannelIndex = index;
									selectedChannel = channel.id;
								}}
								class="item {channel.id == selectedChannel ? 'active' : ''}"
							>
								<img src={channel.image} alt="" />
								<div>{channel.name}</div>
							</li>
						{/each}
					</ul>
				</aside>
				<section class="chatbox">
					{#if channels[selectedChannelIndex]}
						<section class="topbar">
							<img src={channels[selectedChannelIndex].image} alt="" />
							<div class="text-base">{channels[selectedChannelIndex].name}</div>
						</section>
						<hr class="h-[1px] border-0 bg-white/10" />
						<section bind:this={messagesContainer} class="messages">
							{#each channels[selectedChannelIndex].message as message}
								<div
									transition:scale
									class="message {message.sentBy.id == $user?.chatNodeId ? 'mymessage' : ''}"
								>
									<div class="info">
										<div class="">{message.sentBy.name}</div>
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
									<hr class="h-[1px] border-0 bg-white/20" />
									<div class="content">{message.text}</div>
									<!-- <div class="bottombar">20/04/2021</div> -->
								</div>
							{/each}
						</section>
						<hr class="h-[1px] border-0 bg-white/10" />
						<form on:submit|preventDefault={send} class="bottombar">
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
												: 'hover:bg-base-200'}"
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
		<Footer />
	</section>
</section>

<style lang="scss">
	.chatlayout {
		overflow-y: auto;
		display: grid;
		grid-template-columns: 3fr 9fr;
		gap: 16px;
	}
	.chatnode {
		@apply bg-base-200;
		@apply rounded-md;
		padding: 4px 0;
		.list {
			display: grid;
		}
		.item {
			padding: 8px 16px;
			display: flex;
			gap: 8px;
			align-items: center;
			border-radius: 2px;
			&:hover {
				@apply bg-base-300;
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
		@apply bg-base-200;
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
				@apply bg-base-300;
				width: fit-content;
				max-width: 80%;
				border-radius: 12px 12px 12px 4px;
				overflow-wrap: anywhere;
			}
			.mymessage {
				@apply bg-primary;
				justify-self: end;
				border-radius: 12px 12px 4px 12px;
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
				padding: 6px 8px;
			}
			.bottombar {
			}
		}
		.bottombar {
			padding: 12px 18px;
		}
	}
</style>
