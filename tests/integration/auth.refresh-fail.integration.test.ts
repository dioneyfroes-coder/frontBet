import { expect, it, describe, vi } from 'vitest';

import { apiFetch, ApiError } from '../../app/lib/api';
import * as tokenModule from '../../app/lib/token';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh failure', () => {
  it('clears tokens and throws when refresh endpoint fails', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // seed tokens. This test expects the backend to fail refresh for the
    // provided tokens. Running it requires a seeded backend and explicit
    // opt-in: set `USE_REAL_BACKEND=true` and `RUN_AUTH_REFRESH_FAIL=true`.
    if (process.env.RUN_AUTH_REFRESH_FAIL !== 'true') {
      // Skip by early return to avoid false failures in most environments.
      return;
    }

    tokenModule.setTokens({ accessToken: 'expired', refreshToken: 'refresh-old' });

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
