import { create } from 'zustand';
import { z } from 'zod';
import { apiFetch, validateWithSchema } from '../lib/api';
import type { components } from '../lib/api-client/types';

type Wallet = components['schemas']['Wallet'];

const WalletSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.object({ amount: z.number(), currency: z.string() }),
  createdAt: z.string(),
});

type WalletState = {
  wallet?: Wallet | null;
  loading: boolean;
  error?: string;
  fetchWallet: () => Promise<void>;
  setWallet: (w: Wallet | null) => void;
};

export const useWalletStore = create<WalletState>((set: (s: Partial<WalletState> | ((s: WalletState) => Partial<WalletState>)) => void) => ({
  wallet: undefined,
  loading: false,
  error: undefined,
  setWallet: (w: Wallet | null) => set({ wallet: w }),
  fetchWallet: async () => {
    set({ loading: true, error: undefined });
    try {
      const resp = await apiFetch<{ success: boolean; data: z.infer<typeof WalletSchema> }>(
        '/api/wallets/me',
        { validate: z.object({ success: z.boolean(), data: WalletSchema }) }
      );
      const data = resp.data;
      // runtime check
      validateWithSchema(WalletSchema, data);
      set({ wallet: data, loading: false });
    } catch (err) {
      const e = err as { message?: string } | undefined;
      // log for test debugging
      // eslint-disable-next-line no-console
      console.warn('[useWalletStore] fetchWallet error:', err);
      set({ error: e?.message ?? String(err), loading: false });
    }
  },
}));
