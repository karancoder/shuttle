import type { Network } from "../../../internals/network";
import type { WalletConnection } from "../../../internals/wallet";
import type { SigningResult } from "../../../internals/transactions";
import type { TransactionMsg } from "../../../internals/transactions/messages";
import type WalletMobileProvider from "../../../providers/mobile/WalletMobileProvider";

export interface MobileProviderAdapter {
  init(provider: WalletMobileProvider, params: { walletConnectProjectId?: string }): Promise<void>;
  isReady(): boolean;
  isConnected(): boolean;
  getWalletConnection(provider: WalletMobileProvider, options: { network: Network }): Promise<WalletConnection>;
  connect(
    provider: WalletMobileProvider,
    options: { network: Network; callback?: ((wallet: WalletConnection) => void) | undefined },
  ): Promise<string>;
  disconnect(provider: WalletMobileProvider, options: { network: Network }): Promise<void>;
  sign(
    provider: WalletMobileProvider,
    options: {
      network: Network;
      messages: TransactionMsg[];
      wallet: WalletConnection;
      feeAmount?: string | null;
      gasLimit?: string | null;
      memo?: string | null;
      overrides?: {
        rpc?: string;
        rest?: string;
      };
      intents: { androidUrl: string; iosUrl: string };
    },
  ): Promise<SigningResult>;
}

export * from "./CosmosWalletConnect";
export * from "./EvmWalletConnect";
