import { expect, it, describe, vi } from 'vitest';

import { apiFetch, ApiError } from '../../lib';
import * as tokenModule from '../../lib/token';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh failure', () => {
  it('clears tokens and throws when refresh endpoint fails', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // This test requires a backend configured to fail refresh for the given
    // tokens. Gate it behind an explicit flag to avoid false failures.
    if (process.env.RUN_AUTH_REFRESH_FAIL !== 'true') {
      return;
    }

    const badRefresh = process.env.TEST_BAD_REFRESH_TOKEN;
    if (!badRefresh) {
      throw new Error('Set TEST_BAD_REFRESH_TOKEN to run the refresh failure test.');
    }
    const badAccess = process.env.TEST_BAD_ACCESS_TOKEN ?? 'expired';
    tokenModule.setTokens({ accessToken: badAccess, refreshToken: badRefresh });

    const spy = vi.spyOn(tokenModule, 'clearTokens');

    let threw = false;
    try {
      await apiFetch('/api/wallets/me');
    } catch (err) {
      threw = true;
      expect(err).toBeInstanceOf(ApiError);
    }
    expect(threw).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
