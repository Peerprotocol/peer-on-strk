import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  // GlowWalletAdapter,
  PhantomWalletAdapter,
  CloverWalletAdapter,
  LedgerWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ReactNode, useEffect } from "react";

import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from "react-hot-toast";
import { useUserState } from "@/hooks/user_states";
import { init } from "next/dist/compiled/webpack/webpack";

interface WalletConnectProviderProps {
  children: any;
}

export const WalletConnectProvider = ({
  children,
}: WalletConnectProviderProps) => {
  let network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    return clusterApiUrl(network);
  }, [network]);

  // const wallets = [new PhantomWalletAdapter(), new CloverWalletAdapter()];
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new LedgerWalletAdapter(),
      // new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    [network]
  );

  // useEffect(() => {
  //   // Fetch a userprofile from the blockchain

  //   findProfileAccounts();
  // }, [publicKey, program, transactionPending]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <Toaster />
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={(e) => console.log(e)}
      >
        <WalletModalProvider>
          <InnerProvider>{children}</InnerProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
const InnerProvider = ({ children }: { children: ReactNode }) => {
  const {
    findProfileAccounts,
    publicKey,
    program,
    transactionPending,
    setInitialized,
    initialized,
  } = useUserState();
  useEffect(() => {
    findProfileAccounts();
    setInitialized(true);
  }, [publicKey, program, transactionPending, initialized]);

  return <>{children}</>;
};
