<script lang="ts" setup>
import { ref } from "vue";
import { WalletConnection, isAndroid, isIOS, isMobile } from "@delphi-labs/shuttle";
import { useShuttle } from "@delphi-labs/shuttle-vue";
import QrcodeVue from "qrcode.vue";

import { useShuttlePortStore } from "@/stores/shuttle-port";
import { networks } from "@/config/networks";
import useWallet from "@/composables/useWallet";

const shuttle = useShuttle();
const networkStore = useShuttlePortStore();
const wallet = useWallet();

async function connect(extensionProviderId: string) {
  await shuttle.connect({
    extensionProviderId: extensionProviderId,
    chainId: networkStore.currentNetworkId,
  });
}

const qrcodeUrl = ref<string | null>(null);

async function mobileConnect(mobileProviderId: string) {
  const urls = await shuttle.mobileConnect({
    mobileProviderId: mobileProviderId,
    chainId: networkStore.currentNetworkId,
    callback: () => {
      qrcodeUrl.value = null;
    },
  });

  if (isMobile()) {
    if (isAndroid()) {
      window.location.href = urls.androidUrl;
    } else if (isIOS()) {
      window.location.href = urls.iosUrl;
    } else {
      window.location.href = urls.androidUrl;
    }
  } else {
    qrcodeUrl.value = urls.qrCodeUrl;
  }
}

function disconnectWallet(wallet: WalletConnection) {
  shuttle.disconnectWallet(wallet);
}
</script>

<template>
  <header>
    <h1>Shuttle Port (Vue)</h1>

    <hr />

    <div>
      <label htmlFor="currentNetwork">Current network:</label>
      <select
        id="currentNetwork"
        :value="networkStore.currentNetworkId"
        @change="networkStore.switchNetwork(($event.target as HTMLInputElement).value)"
      >
        <option v-for="network in networks" :key="network.chainId" :value="network.chainId">
          {{ network.name }}
        </option>
      </select>
    </div>

    <hr />

    <div v-if="!wallet">
      <button
        v-for="extensionProvider in shuttle.extensionProviders.filter((provider) =>
          provider.networks.has(networkStore.currentNetworkId),
        )"
        :key="extensionProvider.id"
        @click="() => connect(extensionProvider.id)"
        :disabled="!shuttle.availableExtensionProviders.find((p) => p.id === extensionProvider.id)"
      >
        {{ extensionProvider.name }}
      </button>
      <button
        v-for="mobileProvider in shuttle.mobileProviders.filter((provider) =>
          provider.networks.has(networkStore.currentNetworkId),
        )"
        :key="mobileProvider.id"
        @click="() => mobileConnect(mobileProvider.id)"
        :disabled="!shuttle.availableMobileProviders.find((p) => p.id === mobileProvider.id)"
      >
        {{ mobileProvider.name }}
      </button>
    </div>
    <div v-else>
      <div>
        <p>Address: {{ wallet.account.address }}</p>
        <button @click="() => disconnectWallet(wallet!)">Disconnect</button>
      </div>
    </div>
    <hr />
  </header>

  <div v-if="qrcodeUrl" className="fixed inset-0 flex flex-col items-center justify-center">
    <div className="absolute inset-0 z-0 bg-black opacity-20" @click="qrcodeUrl = null"></div>
    <div
      className="relative flex min-h-[408px] min-w-[384px] flex-col items-center rounded-lg bg-white py-10 px-14 shadow-md"
    >
      <button className="absolute top-3 right-3 rounded bg-black p-1.5 text-white" @click="qrcodeUrl = null">
        Close
      </button>

      <h2 className="mb-2 text-xl">Wallet Connect</h2>

      <div className="flex flex-col items-center">
        <p className="mb-4 text-center text-sm text-gray-600">Scan this QR code with your mobile wallet</p>
        <QrcodeVue :value="qrcodeUrl" :size="250" />
      </div>
    </div>
  </div>
</template>
