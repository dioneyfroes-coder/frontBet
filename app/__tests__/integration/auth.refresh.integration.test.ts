import { expect, it, describe } from 'vitest';

import { apiFetch, setTokens, clearTokens } from '../../lib';
import { ensureIntegrationTokens } from '../../../tests/utils/integration-auth';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh flow (401 -> refresh -> retry)', () => {
  it('refreshes token on 401 and retries original request with new token', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // ensure clean state
    clearTokens();

    const seeded = await ensureIntegrationTokens({ requireRefresh: true });
    if (!seeded.refreshToken) {
      throw new Error(
        'Refresh flow requires TEST_REFRESH_TOKEN or backend login returning refreshToken.'
      );
    }

    // seed expired tokens. The backend must accept the refresh token and
    // issue new tokens for this test to pass when `USE_REAL_BACKEND=true`.
    setTokens({ accessToken: 'expired-token', refreshToken: seeded.refreshToken });

    // Call the real backend and expect it to perform refresh and return a wallet.
    const res = await apiFetch('/api/wallets/me');
    type WalletEnvelope = {
      data?: {
        id?: string;
        balance?: { amount?: number | null } | null;
      } | null;
    };
    const wallet = (res as WalletEnvelope)?.data;
    expect(wallet).toBeTruthy();
    expect(typeof wallet?.id === 'string' || typeof wallet?.balance?.amount === 'number').toBe(
      true
    );
  });
});
