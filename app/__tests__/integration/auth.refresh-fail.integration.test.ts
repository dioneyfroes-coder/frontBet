import { expect, it, describe, vi } from 'vitest';
import { server } from '../../mocks/server';
import { http } from 'msw';

import { apiFetch, ApiError } from '../../lib';
import * as tokenModule from '../../lib/token';

describe('Auth refresh failure', () => {
  it('clears tokens and throws when refresh endpoint fails', async () => {
    // seed tokens
    tokenModule.setTokens({ accessToken: 'expired', refreshToken: 'refresh-old' });

    // Make wallet return 401 to trigger refresh
    server.use(
      http.get(
        ({ request }) => new URL(request.url).pathname === '/api/wallets/me',
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
        ({ request }) => new URL(request.url).pathname === '/api/auth/refresh',
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
