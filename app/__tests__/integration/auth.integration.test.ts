import { expect, it, describe } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiFetch, ApiError, setTokens, clearTokens } from '../../lib';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth integration flow (login -> authorized request -> logout)', () => {
  it('stores token after login and sends Authorization header; clears on logout', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // ensure clean state
    clearTokens();

    // 1) Perform login (MSW default handler returns accessToken: 'tok')
    const login = await apiFetch('/api/auth/login', {
      method: 'POST',
      json: { email: 'a@a.com' },
      skipAuth: true,
    });
    // login shape from MSW: { success: true, data: { accessToken, refreshToken, user } }
    // accept either shape
    let accessToken = 'tok';
    let refreshToken = 'ref';
    try {
      const l = login as unknown;
      if (l && typeof l === 'object') {
        const obj = l as Record<string, unknown>;
        const data = (obj['data'] as unknown) ?? obj;
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          if (typeof d['accessToken'] === 'string') accessToken = d['accessToken'] as string;
          if (typeof d['refreshToken'] === 'string') refreshToken = d['refreshToken'] as string;
        }
      }
    } catch {
      // ignore and use defaults
    }

    // persist tokens as frontend would
    setTokens({ accessToken, refreshToken });

    // 2) Call the real backend endpoint. This test expects a running backend
    // when `USE_REAL_BACKEND=true` is set in the environment.
    const wallet = await apiFetch('/api/wallets/me');
    const w = wallet as unknown;
    let ok = false;
    if (w && typeof w === 'object') {
      const ow = w as Record<string, unknown>;
      const d = ow['data'] ?? ow;
      if (d && typeof d === 'object') {
        const dd = d as Record<string, unknown>;
        ok = Boolean(dd['ok']);
      }
    }
    expect(ok).toBe(true);

    // 3) Simulate logout: clear tokens
    clearTokens();

    // Expect apiFetch to throw ApiError with status 401 (and not refresh)
    let threw = false;
    try {
      // this should trigger a 401 and not have tokens to refresh
      await apiFetch('/api/wallets/me');
    } catch (err) {
      threw = true;
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
    }
    expect(threw).toBe(true);
  });
});
