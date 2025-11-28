import { expect, it, describe, vi } from 'vitest';

import { apiFetch, ApiError } from '../../app/lib/api';
import * as tokenModule from '../../app/lib/token';

import { server, http } from '../../app/mocks/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh failure', () => {
  it('clears tokens and throws when refresh endpoint fails', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // seed tokens
    tokenModule.setTokens({ accessToken: 'expired', refreshToken: 'refresh-old' });

    // Make wallet return 401 to trigger refresh
    server.use(
      http.get(
        ({ request }: any) => new URL(request.url).pathname === '/api/wallets/me',
        () =>
          new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );

    // Make refresh endpoint fail
    server.use(
      http.post(
        ({ request }: any) => new URL(request.url).pathname === '/api/auth/refresh',
        () =>
          new Response(JSON.stringify({ error: 'server' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );

    const spy = vi.spyOn(tokenModule, 'clearTokens');

    let threw = false;
    try {
      await apiFetch('/api/wallets/me');
    } catch (err) {
      threw = true;
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
    }
    expect(threw).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
