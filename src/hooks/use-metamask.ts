import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useToast } from "./use-toast";

interface MetaMaskState {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  isInstalled: boolean;
}

export const useMetaMask = () => {
  const { toast } = useToast();
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    account: null,
    chainId: null,
    isInstalled: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Check if MetaMask is installed
  const checkMetaMaskInstalled = useCallback(() => {
    const isInstalled =
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      window.ethereum.isMetaMask;

    setState((prev) => ({ ...prev, isInstalled }));
    return isInstalled;
  }, []);

  // ✅ Connect Wallet
  const connectWallet = useCallback(async () => {
    if (!checkMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension to continue.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const chainId = (await window.ethereum!.request({
        method: "eth_chainId",
      })) as string;

      setState({
        isConnected: true,
        account: accounts[0],
        chainId,
        isInstalled: true,
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

      return accounts[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkMetaMaskInstalled, toast]);

  // ✅ Disconnect Wallet
  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      isInstalled: state.isInstalled,
    });

    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from MetaMask",
    });
  }, [state.isInstalled, toast]);

  // ✅ Sign Message
  const signMessage = useCallback(
    async (message: string) => {
      if (!state.isConnected || !state.account) {
        throw new Error("Wallet not connected");
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        return signature;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Failed to sign message:", error);
        throw new Error(error.message || "Failed to sign message");
      }
    },
    [state.isConnected, state.account]
  );

  // ✅ Listen for account & chain changes
  useEffect(() => {
    if (!checkMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState((prev) => ({ ...prev, account: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState((prev) => ({ ...prev, chainId }));
    };

    window.ethereum!.on("accountsChanged", handleAccountsChanged);
    window.ethereum!.on("chainChanged", handleChainChanged);

    // Auto-check if already connected
    window.ethereum!
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const accs = accounts as string[];
        if (accs.length > 0) {
          window.ethereum!
            .request({ method: "eth_chainId" })
            .then((chainId) => {
              setState({
                isConnected: true,
                account: accs[0],
                chainId: chainId as string,
                isInstalled: true,
              });
            });
        }
      })
      .catch((err) => console.error(err));

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [checkMetaMaskInstalled, disconnectWallet]);

  return {
    ...state,
    isLoading,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
};
