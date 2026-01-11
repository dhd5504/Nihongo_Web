import { create } from 'zustand';
import { ethers, BrowserProvider } from 'ethers';

interface WalletState {
    walletAddress: string | null;
    provider: BrowserProvider | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useWalletStore = create<WalletState>((set) => ({
    walletAddress: null,
    provider: null,
    connectWallet: async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                // Ethers v6: send("eth_requestAccounts", []) is similar but provider.send(...) works
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                set({ walletAddress: address, provider });

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts: string[]) => {
                    if (accounts.length > 0) {
                        set({ walletAddress: accounts[0] });
                    } else {
                        set({ walletAddress: null });
                    }
                });

            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    },
    disconnectWallet: () => set({ walletAddress: null, provider: null }),
}));
