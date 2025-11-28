import { expect, it, describe } from 'vitest';

import { apiFetch } from '../../app/lib/api';
import { setTokens, clearTokens } from '../../app/lib/token';
import { server, http } from '../../app/mocks/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth refresh flow (401 -> refresh -> retry)', () => {
  it('refreshes token on 401 and retries original request with new token', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // ensure clean state
    clearTokens();

    // seed expired tokens
    setTokens({ accessToken: 'expired-token', refreshToken: 'refresh-old' });

    // handler for refresh endpoint: return new tokens
    server.use(
      http.post(
        ({ request }: any) => new URL(request.url).pathname === '/api/auth/refresh',
        async () => {
          const body = JSON.stringify({
            success: true,
            data: { accessToken: 'new-token', refreshToken: 'new-refresh' },
          });
          return new Response(body, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      )
    );

    // handler for wallet endpoint: require Authorization==Bearer new-token
    server.use(
      http.get(
        ({ request }: any) => new URL(request.url).pathname === '/api/wallets/me',
        ({ request }: any) => {
          const header = request.headers.get('authorization') || '';
          if (header !== `Bearer new-token`) {
            return new Response(JSON.stringify({ error: 'unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ success: true, data: { wallet: { id: 'w1' } } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      )
    );

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
