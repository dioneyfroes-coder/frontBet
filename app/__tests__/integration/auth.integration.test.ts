import { expect, it, describe } from 'vitest';

import { apiFetch, ApiError, setTokens, clearTokens } from '../../lib';
import { getTestCredentials } from '../../../tests/utils/integration-auth';
import type { TestLoginEnvelope } from '../../../tests/utils/integration-auth';

const describeMaybe = process.env.RUN_AUTH_INTEGRATION === 'true' ? describe : describe.skip;

describeMaybe('Auth integration flow (login -> authorized request -> logout)', () => {
  it('stores token after login and sends Authorization header; clears on logout', async () => {
    if (process.env.USE_REAL_BACKEND !== 'true') {
      return;
    }
    // ensure clean state
    clearTokens();

    const creds = getTestCredentials();
    if (!creds) {
      throw new Error('Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run auth integration tests.');
    }

    // 1) Perform login using real backend credentials
    const login = await apiFetch<TestLoginEnvelope>('/api/auth/login', {
      method: 'POST',
      json: { email: creds.email, password: creds.password },
      skipAuth: true,
    });
    const accessToken = login?.data?.accessToken;
    const refreshToken = login?.data?.refreshToken;
    if (!accessToken || !refreshToken) {
      throw new Error('Auth login must return accessToken and refreshToken.');
    }

    // persist tokens as frontend would
    setTokens({ accessToken, refreshToken });

    // 2) Call the real backend endpoint. This test expects a running backend
    // when `USE_REAL_BACKEND=true` is set in the environment.
    const wallet = await apiFetch('/api/wallets/me');
    type WalletEnvelope = {
      data?: {
        id?: string;
        balance?: { amount?: number | null } | null;
      } | null;
    };
    const walletData = (wallet as WalletEnvelope)?.data;
    const hasIdentifier = typeof walletData?.id === 'string' && walletData.id.length > 0;
    const hasBalance = typeof walletData?.balance?.amount === 'number';
    expect(hasIdentifier || hasBalance).toBe(true);

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
