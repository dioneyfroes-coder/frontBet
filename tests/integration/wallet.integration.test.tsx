import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { I18nProvider } from '../../app/i18n/i18n-provider';
import { useWallet } from '../../app/hooks/useWallet';

function WalletConsumer() {
  const { wallet, loading } = useWallet();
  if (loading) return <div>Loading...</div>;
  if (!wallet) return <div>No wallet</div>;
  return (
    <div>
      <div data-testid="wallet-id">{wallet.id}</div>
      <div data-testid="wallet-balance">{wallet.balance?.amount}</div>
    </div>
  );
}

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Wallet integration', () => {
  // Global fetch mock provided in `vitest.setup.ts`, so no local fetch mock is needed

  it('fetches wallet and shows balance', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      // Integration test requires backend; skip when not explicitly enabled.
      return;
    }
    render(
      <I18nProvider initialLocale="pt-BR">
        <WalletConsumer />
      </I18nProvider>
    );

    await waitFor(() => expect(screen.getByTestId('wallet-id')).toBeInTheDocument());
    expect(screen.getByTestId('wallet-balance').textContent).toBeTruthy();
  });
});
