<script context="module" lang="ts">
  import {
    MaterialAppMin,
    Badge,
    Card,
    Icon,
    List,
    ListItem,
    Footer,
    Button,
  } from "svelte-materialify/src";
  import {
    mdiHistory,
    mdiHomeOutline,
    mdiAccountOutline,
    mdiAccountCogOutline,
    mdiCubeOutline,
    mdiMessageTextOutline,
  } from "@mdi/js";
  import CartCard from "$components/cart-card.svelte";
  import Snackbar from "$components/snackbar.svelte";
  import UserUnauthDialog from "$components/user-unauth-dialog.svelte";
  import Calendar from "$components/calendar.svelte";
  import ProgressLinear from "$components/progress-linear.svelte";
  import Appbar from "../../_appbar.svelte";

  import { onMount, onDestroy, getContext } from "svelte";
  import { slide } from "svelte/transition";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Currency, wait } from "$lib/helper";

  import type { ObserverUnsafe } from "$lib/helper";
  import type { BuyerClient } from "../../__layout.svelte";

  const title = "Pesanan";
  const navigation = [
    {
      name: "Home",
      icon: mdiHomeOutline,
      link: `/cleaner/`,
    },
    {
      name: "Chat",
      icon: mdiMessageTextOutline,
      link: `/cleaner/chat`,
    },
    {
      name: "History",
      icon: mdiHistory,
      link: `/cleaner/history`,
    },
    {
      name: "Account",
      icon: mdiAccountCogOutline,
      link: `/cleaner/account`,
    },
  ];
</script>

<script lang="ts">
  const client = getContext<BuyerClient>("buyer");
  const is_desktop = getContext<ObserverUnsafe<boolean>>("is_desktop");
  let user_login: BuyerClient.User;
  let orders: BuyerClient.Transaction[] = [];
  let path = $page.url.pathname;
  let progress: ProgressLinear;
  let snackbar: Snackbar;
  let showUserUnauthDialog = false;

  $: loading = progress?.active;

  onMount(init);
  onDestroy(release);
  async function init() {
    try {
      await client.ready;
      user_login = await client.api.user.auth();
      orders = await client.api.transaction.get_all_by({
        by: "customer",
        id: user_login.id,
      });
    } catch (error: any) {
      if (error.type == client.api.buyer.api.Error.FailedAuthentication.type) {
        showUserUnauthDialog = true;
        return;
      }
      snackbar.setText(error.message);
      snackbar.show();
    } finally {
      progress.loaded();
    }
  }
  async function release() {}
  async function submit() {
    try {
      progress.loading();

      snackbar.setText("Berhasil Pesan");
    } catch (error: any) {
      snackbar.setText(error.message);
    } finally {
      snackbar.show();
      progress.loaded();
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="" content="" />
</svelte:head>

<div transition:slide>
  <MaterialAppMin>
    <ProgressLinear
      bind:this={progress}
      backgroundColor="secondary-color"
      color="secondary-color"
    />
    <Appbar
      loading={$loading}
      desktop={$is_desktop}
      {title}
      back_nav
      navigation={[]}
    />
    <main class="main">
      <List>
        {#each orders as item}
          <Card>
            <ListItem
              on:click={() => {
                goto("/order/nota/" + item.id);
              }}
            >
              <span slot="prepend">
                <Icon path={mdiCubeOutline} />
              </span>
              <span>{item.data.services.join(" ")}</span>
              <span slot="subtitle"
                >{new Date(item.created_on).toLocaleDateString()}</span
              >
            </ListItem>
          </Card>
        {/each}
      </List>
    </main>
    <UserUnauthDialog bind:active={showUserUnauthDialog} />
    <Snackbar bind:this={snackbar} />
  </MaterialAppMin>
</div>

<style lang="scss">
  @import "../../../components/common";
  @import "../../../components/elevation";
  @import "../../../components/skeleton";
  .loading {
    @include loading-sekeleton;
  }
  .main {
    padding: 32px 16px 16px;
    display: grid;
    @include main;
  }
  .form {
    display: flex;
    flex-flow: column;
    row-gap: 24px;
  }
  .section {
    display: grid;
    row-gap: 16px;
    &.pad {
      padding: 12px 20px;
    }
  }
  .subsection {
    display: grid;
    row-gap: 8px;
  }
  .card {
    @include elevation;
    border-radius: 6px;
  }
  .textfield {
    height: 48px;
  }
  .t-1 {
    font-size: 24px;
    font-weight: 500;
    line-height: normal;
  }
  .t-2 {
    font-size: 20px;
    font-weight: 500;
    line-height: normal;
    opacity: 0.9;
  }
  .t-3 {
    font-size: 18px;
    font-weight: 500;
    line-height: normal;
  }
  .t-4 {
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
    opacity: 0.8;
  }
  .o-7 {
    opacity: 0.74;
  }
  .flex {
    display: flex;
    gap: 16px;
  }
  .column {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
    justify-content: space-between;
    .start {
      justify-self: start;
    }
    .end {
      justify-self: end;
    }
  }
  .hr {
    display: block;
    height: 1px;
    width: stretch;
    background-color: #00000030;
    border: none;
  }
  .btn {
    display: grid;
    width: stretch;
  }
  .list {
    display: flex;
    gap: 16px;
  }
  .nav {
    width: stretch;
    height: stretch;
    display: flex;
    ul {
      flex: 1 1 auto;
      list-style: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    li {
      width: 56px;
      height: 56px;
    }
    a {
      display: grid;
      justify-items: center;
      row-gap: 4px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 10px;
    }
  }
  * :global {
    @include common-app;
    @include common-loader;
    @include common-footer;
    .s-card {
      margin-block: 8px;
    }
    .nav {
      .s-btn.icon,
      .s-btn.s-btn--fab {
        border-radius: 6px;
      }
    }
    .s-badge {
      width: 100%;
    }
  }
</style>
