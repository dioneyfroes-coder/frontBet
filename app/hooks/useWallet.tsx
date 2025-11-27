import { useEffect } from 'react';
import { useWalletStore } from '../stores/useWalletStore';

export function useWallet() {
  const wallet = useWalletStore((s) => s.wallet);
  const loading = useWalletStore((s) => s.loading);
  const error = useWalletStore((s) => s.error);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);

  useEffect(() => {
    if (wallet === undefined) fetchWallet();
  }, [wallet, fetchWallet]);

  return { wallet, loading, error, refresh: fetchWallet };
}
