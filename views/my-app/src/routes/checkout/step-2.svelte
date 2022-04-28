<script context="module" lang="ts">
  import { MaterialAppMin, Footer, Button } from "svelte-materialify/src";
  import CartCard from "$components/cart-card.svelte";
  import Snackbar from "$components/snackbar.svelte";
  import UserUnauthDialog from "$components/user-unauth-dialog.svelte";
  import Address, { Map } from "./_address.svelte";
  import Calendar from "$components/calendar.svelte";
  import ProgressLinear from "$components/progress-linear.svelte";
  import Appbar from "../_appbar.svelte";

  import { onMount, onDestroy, getContext } from "svelte";
  import { slide } from "svelte/transition";
  import { session } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Currency, wait } from "$lib/helper";

  import type { ObserverUnsafe } from "$lib/helper";
  import type { BuyerClient } from "../__layout.svelte";
</script>

<script lang="ts">
  const client = getContext<BuyerClient>("buyer");
  const is_desktop = getContext<ObserverUnsafe<boolean>>("is_desktop");
  let user_login: BuyerClient.User;
  let checkout = $session.checkout;
  let time = new Date();
  let buyer: BuyerClient.Buyer;
  let address: BuyerClient.Address | null | undefined;
  let addressList: BuyerClient.Address[] = [];
  let cart: BuyerClient.Cart;
  let items: (BuyerClient.SelectedItem & {
    product: BuyerClient.Product & { store: BuyerClient.Store };
  })[] = [];
  let procedure: BuyerClient.Business;
  let progress: ProgressLinear;
  let fakeItems = Array(4);
  let snackbar: Snackbar;
  let orderCost = 0;
  let deliveryCost = 0;
  let totalCost = 0;
  let itemAmount = 0;
  let weight: number[] = [];
  let range: number[] = [];
  let editAddress = false;
  let showUserUnauthDialog = false;
  let disableSubmit = true;

  $: loading = progress?.active;
  $: checkAddress(address);

  onMount(init);
  onDestroy(release);
  async function init() {
    try {
      await client.ready;
      user_login = await client.api.user.auth();

      if (!checkout) {
        throw Error("Something Wrong");
      }

      fakeItems = Array(0);
      address = null;
      disableSubmit = false;
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
  function checkAddress(tag: any) {
    if (address) {
      if (address.name && address.telp && address.value) {
        // wait({
        //   timeout: 250,
        //   delay: 1016,
        //   arg: address,
        //   callback: direction,
        // });
      } else {
      }
    } else {
    }
  }
  async function direction(address: BuyerClient.Address) {
    try {
      progress.loading();
      disableSubmit = true;
      range = [];
      const stores = new Set<number>();
      for (const item of items) {
        const { id, position } = item.product.store;
        if (stores.has(id)) {
        } else {
          stores.add(id);
          const response = await Map.mbxDirections
            .getDirections({
              profile: "driving",
              waypoints: [
                { coordinates: address.position as any },
                { coordinates: position },
              ],
            })
            .send();
          range.push(
            (response.body as Map.Directions).routes.reduce(
              (prev, curr) => prev + curr.distance,
              0
            )
          );
        }
      }
      deliveryCost = Math.round(
        procedure.business.deliveryCostCalculatePerDistance *
          (range.reduce((prev, curr) => prev + curr) / 1000)
      );
      totalCost = deliveryCost + orderCost;
      disableSubmit = false;
    } catch (error: any) {
      snackbar.setText(error.message);
      snackbar.show();
    } finally {
      progress.loaded();
    }
  }
  async function submit() {
    try {
      progress.loading();
      disableSubmit = true;
      if (!address) {
        throw new Error("Alamat tidak terjangkau");
      }
      if (!address.value) {
        throw new Error("Alamat belum terpilih");
      }
      if (checkout) {
        checkout.address = {
          coord: address?.position as any,
          name: address?.value,
        };
        checkout.datetime = {
          timestamp: time.getTime(),
          name: time.toLocaleString(),
        };
        $session.checkout = checkout;
        goto("step-3", {replaceState: true});
      }
    } catch (error: any) {
      snackbar.setText(error.message);
      snackbar.show();
      disableSubmit = false;
    } finally {
      progress.loaded();
    }
  }
</script>

<svelte:head>
  <title>Checkout</title>
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
      title="Checkout"
      back_nav
    />
    <main class="main">
      <form id="order" class="form" on:submit|preventDefault={submit}>
        <h2 class="t-2">Lokasi dan Waktu</h2>
        <section class="section card">
          <h3 class="t-3">Lokasi</h3>
          <Address
            bind:data={address}
            menu={addressList}
            editAll={editAddress}
            loader={$loading}
          />
        </section>
        <section class="section card">
          <h3 class="t-3">Waktu</h3>
          <Calendar bind:selected={time} />
        </section>
        <section class="section card">
          <Button type="submit" size="large" class="primary-color">
            Selanjutnya
          </Button>
        </section>
      </form>
    </main>
    <!-- <Footer class="footer white elevation-5">
      <section class="btn">
        <Button
          class={disableSubmit ? "" : "primary-color"}
          type="submit"
          form="order"
          disabled={disableSubmit}>Selanjutnya</Button
        >
      </section>
    </Footer> -->
    <UserUnauthDialog bind:active={showUserUnauthDialog} />
    <Snackbar bind:this={snackbar} />
  </MaterialAppMin>
</div>

<style lang="scss">
  @import "../../components/common";
  @import "../../components/elevation";
  @import "../../components/skeleton";
  .loading {
    @include loading-sekeleton;
  }
  .main {
    padding: 32px 16px 16px;
    display: grid;
    @include main;
  }
  .form {
    display: grid;
    row-gap: 24px;
  }
  .section {
    padding: 12px 20px;
    display: grid;
    row-gap: 16px;
  }
  .subsection {
    padding: 8px 16px;
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
    font-size: 20px;
    font-weight: 500;
    line-height: normal;
  }
  .t-2 {
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
    opacity: 0.9;
  }
  .t-3 {
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    opacity: 0.7;
  }
  .o-7 {
    opacity: 0.74;
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
  .btn {
    display: grid;
    width: stretch;
  }
  * :global {
    @include common-app;
    @include common-loader;
    @include common-footer;
  }
</style>
