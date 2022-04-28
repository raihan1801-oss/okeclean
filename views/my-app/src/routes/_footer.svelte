<script context="module" lang="ts">
	import { slide } from 'svelte/transition';

	import { Button, Icon } from 'svelte-materialify/src';
	import {
		mdiFacebook,
		mdiInstagram,
		mdiEmailOutline,
		mdiMapMarkerOutline,
		mdiClockOutline,
	} from '@mdi/js';

	// import logo from '$static/logo.png';

	import { LANDING_URL } from '$lib/env';

	import { page } from '$app/stores';

	import navigation from '$lib/main-nav';
</script>

<script lang="ts">
	export let desktop = false;
	const footer_navigation = [
		{ name: 'Tentang Ada Ikan', link: `${LANDING_URL}#about` },
		{ name: 'Fitur', link:  `${LANDING_URL}#features` },
		{ name: 'Cara Kerja', link:  `${LANDING_URL}#how_work` },
		{ name: 'Tim Pengembang', link:  `${LANDING_URL}#team` },
	];
	const media_social = [
		{
			name: 'facebook',
			link: 'https://web.facebook.com/profile.php?id=100070789985049',
			icon: mdiFacebook,
		},
		{
			name: 'instagram',
			link: 'https://instagram.com/arwana_startup/',
			icon: mdiInstagram,
		},
		{ name: 'email', link: 'adaikanstartup@gmail.com', icon: mdiEmailOutline },
	];
	const pathname = $page.url.pathname;
</script>

<style lang="scss">
	@import '../components/common';
	@import '../components/elevation';
	.footer {
		display: grid;
		color: white;
		.column {
			padding: 24px 32px;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;
			align-items: start;
			justify-items: center;
			background-color: var(--primary-color);
		}
		.list {
			padding: 24px 32px;
			display: grid;
			gap: 16px;
			background-color: var(--primary-color);
		}
		.about {
			display: grid;
			gap: 16px;
		}
		.link {
			display: grid;
			gap: 16px;
		}
		.address {
			display: grid;
			gap: 16px;
		}
		.time {
			display: grid;
			gap: 16px;
		}
		.copy {
			padding: 16px;
			display: grid;
			place-content: center;
			background-color: var(--tertiary-color);
			p {
				margin: 0;
			}
		}
		.logo {
			width: max-content;
			display: grid;
			justify-items: center;
			gap: 4px;
			.name {
				font-size: 18px;
				font-weight: 700;
			}
		}
		.page {
			ul {
				padding: 0;
				display: grid;
				gap: 8px;
			}
			li {
				list-style: none;
			}
		}
		.media-social {
			ul {
				width: max-content;
				padding: 0;
				display: flex;
				gap: 16px;
			}
			li {
				list-style: none;
			}
		}
	}
	a {
		color: inherit;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
	.nav {
		@include elevation;
		position: sticky;
		bottom: 0;
		padding: 4px;
		display: grid;
		align-items: center;
		background-color: white;
		ul {
			padding: 0;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			justify-items: center;
		}
		li {
			list-style: none;
			padding: 2px;
		}
		a {
			display: grid;
			justify-items: center;
			row-gap: 2px;
			text-decoration: none;
			border-radius: 6px;
			text-transform: capitalize;
			font-size: 11px;
		}
	}
	:global {
		.nav {
			.s-btn.icon,
			.s-btn.s-btn--fab {
				border-radius: 6px;
			}
		}
	}
</style>

<footer class="footer">
	<div class="{desktop ? 'column' : 'list'}">
		<div class="about">
			<div class="logo">
				<img src="logo.png" alt="Ada Ikan" width="48" height="48" />
				<div class="name">Ada Ikan</div>
			</div>
			<p>
				Ada Ikan adalah sebuah website yang dibuat oleh team Arwana Start Up
				untuk mempermudah masyarakat dalam mencari dan membeli ikan dengan
				menghubungkan pembeli dan penjual ikan
			</p>
		</div>
		<div class="link">
			<nav class="page">
				<ul>
					{#each footer_navigation as item}
						<li>
							<a rel="external" href="{item.link}"
								>{item.name}
								<div class="{pathname == item.link ? 'active' : ''}"></div>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<div>
				Ikuti Kami di:
				<nav class="media-social">
					<ul>
						{#each media_social as item}
							<li>
								<a href="{item.link}">
									<Icon path="{item.icon}" style="color: currentColor;" />
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
		<div class="address">
			<Icon
				size="{44}"
				path="{mdiMapMarkerOutline}"
				style="color: currentColor;"
			/>
			<address>
				<div>Kantor</div>
				<div>
					(Perumahan Graha Lestari, Jl. Tun Abdul Razak, Hertasning Baru, Kec.
					Manggala, Kota Makassar, Sulawesi Selatan 90233)
				</div>
			</address>
		</div>
		<div class="time">
			<Icon size="{44}" path="{mdiClockOutline}" style="color: currentColor;" />
			<time>
				<div>Jam Kerja</div>
				<div>(Setiap hari 07:00 - 22:00)</div>
			</time>
		</div>
	</div>
	<div class="copy">
		<p>Copyright &copy; 2021 Ada Ikan - Arwana, All Right Reserved.</p>
	</div>
</footer>

{#if !desktop}
	<nav transition:slide class="nav">
		<ul>
			{#each navigation as item}
				<li>
					<Button text fab size="large">
						<a
							class="{pathname == item.link
								? 'primary-text'
								: 'grey-text text-darken-3'}"
							href="{item.link}"
							><Icon path="{item.icon}" />
							<div>{item.name}</div>
						</a>
					</Button>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
