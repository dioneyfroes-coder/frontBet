import { apiFetch } from '../../app/lib/api';
import { setTokens, clearTokens } from '../../app/lib/token';

export type TestLoginEnvelope = {
  data?: {
    accessToken?: string;
    refreshToken?: string | null;
  } | null;
};

type TokenSource = 'env-token' | 'env-refresh' | 'bypass' | 'login';

type TokenResult = {
  source: TokenSource;
  accessToken: string;
  refreshToken?: string | null;
};

function applyTokens(accessToken: string, refreshToken?: string | null) {
  setTokens({ accessToken, refreshToken });
  process.env.INTEGRATION_AUTH_TOKEN = accessToken;
  if (refreshToken) {
    process.env.TEST_REFRESH_TOKEN = refreshToken;
  }
}

export function getTestCredentials() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export function seedTokensFromEnv(): TokenResult | null {
  const bypass = process.env.TEST_BYPASS_USER_ID;
  if (bypass) {
    applyTokens(bypass, null);
    return { source: 'bypass', accessToken: bypass, refreshToken: null };
  }

  const access = process.env.TEST_ACCESS_TOKEN ?? process.env.INTEGRATION_AUTH_TOKEN;
  if (!access) return null;
  const refresh = process.env.TEST_REFRESH_TOKEN ?? null;
  applyTokens(access, refresh);
  return {
    source: refresh ? 'env-refresh' : 'env-token',
    accessToken: access,
    refreshToken: refresh,
  };
}

export async function ensureIntegrationTokens(options?: {
  requireRefresh?: boolean;
}): Promise<TokenResult> {
  const envTokens = seedTokensFromEnv();
  if (envTokens && (!options?.requireRefresh || envTokens.refreshToken)) {
    return envTokens;
  }

  const creds = getTestCredentials();
  if (!creds) {
    throw new Error(
      'Integration tests require credentials or tokens. Set TEST_ACCESS_TOKEN/TEST_REFRESH_TOKEN or TEST_USER_EMAIL/TEST_USER_PASSWORD.'
    );
  }

  clearTokens();
  const login = await apiFetch<TestLoginEnvelope>('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    json: { email: creds.email, password: creds.password },
  });
  const data = login?.data;
  if (!data?.accessToken) {
    throw new Error('Auth login response missing accessToken.');
  }
  applyTokens(data.accessToken, data.refreshToken ?? null);
  return {
    source: 'login',
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
  };
}

// helper intentionally limited to ensureIntegrationTokens/getTestCredentials; add more if future tests require different flows.
