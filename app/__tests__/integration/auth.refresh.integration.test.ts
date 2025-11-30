import { expect, it, describe } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiFetch, setTokens, clearTokens } from '../../lib';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh flow (401 -> refresh -> retry)', () => {
  it('refreshes token on 401 and retries original request with new token', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // ensure clean state
    clearTokens();

    // seed expired tokens. The backend must accept the refresh token and
    // issue new tokens for this test to pass when `USE_REAL_BACKEND=true`.
    setTokens({ accessToken: 'expired-token', refreshToken: 'refresh-old' });

    // Call the real backend and expect it to perform refresh and return a wallet.
    const res = await apiFetch('/api/wallets/me');
    // validate response shape safely
    const r = res as unknown;
    let ok = false;
    if (r && typeof r === 'object') {
      const o = r as Record<string, unknown>;
      const data = o['data'];
      if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        ok = Boolean(d['wallet']);
      }
    }
    expect(ok).toBe(true);
  });
});
