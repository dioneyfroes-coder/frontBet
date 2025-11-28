import { create } from 'zustand';
import { getMyWallet } from '../lib/api/clients/wallet';
import { WalletResponse } from '../lib';
import { z } from 'zod';

type Wallet = z.infer<typeof WalletResponse>['data'];

type WalletState = {
  wallet?: Wallet | null;
  loading: boolean;
  error?: string;
  fetchWallet: () => Promise<void>;
  setWallet: (w: Wallet | null) => void;
};

export const useWalletStore = create<WalletState>(
  (set: (s: Partial<WalletState> | ((s: WalletState) => Partial<WalletState>)) => void) => ({
    wallet: undefined,
    loading: false,
    error: undefined,
    setWallet: (w: Wallet | null) => set({ wallet: w }),
    fetchWallet: async () => {
      set({ loading: true, error: undefined });
      try {
        const wallet = await getMyWallet();
        set({ wallet, loading: false });
      } catch (err) {
        const e = err as { message?: string } | undefined;
        set({ error: e?.message ?? String(err), loading: false });
      }
    },
  })
);
