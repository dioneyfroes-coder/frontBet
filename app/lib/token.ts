type Tokens = { accessToken?: string | null; refreshToken?: string | null };

const STORAGE_KEY = 'frontbet_tokens_v1';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadTokens(): Tokens {
  try {
    if (!isBrowser()) return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Tokens;
  } catch {
    return {};
  }
}

export function saveTokens(tokens: Tokens) {
  try {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

export function clearTokens() {
  try {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function setTokens(t: Tokens) {
  const cur = loadTokens();
  const merged = { ...cur, ...t };
  saveTokens(merged);
}

export function getRefreshToken(): string | null {
  const t = loadTokens();
  return t.refreshToken ?? null;
}

// External provider type: can be sync or async
export type AccessTokenProvider = () => Promise<string | null> | string | null;

let externalAccessTokenProvider: (() => Promise<string | null>) | null = null;

// Serialize in-flight refresh attempts so concurrent callers reuse the same Promise
let refreshInFlight: Promise<string | null> | null = null;

export function registerAccessTokenProvider(fn: AccessTokenProvider | null) {
  if (fn == null) {
    externalAccessTokenProvider = null;
    return;
  }
  // Normalize to async provider
  externalAccessTokenProvider = async () => {
    try {
      const provider = fn as AccessTokenProvider;
      const v = provider();
      return await Promise.resolve(v);
    } catch {
      return null;
    }
  };
}

// Attempts to obtain an access token using (in order):
// 1) registered external provider (recommended, e.g. Clerk)
// 2) global `window.Clerk` heuristics (if Clerk is loaded on the page)
// 3) fallback to localStorage persisted tokens
export async function getAccessToken(): Promise<string | null> {
  // 1) external provider
  try {
    if (externalAccessTokenProvider) {
      const t = await externalAccessTokenProvider();
      if (t) return t;
    }
  } catch {
    // swallow provider errors and fallback
  }
  // Note: we intentionally avoid heuristics that inspect `window` (e.g. Clerk globals).
  // Projects should register an `externalAccessTokenProvider` (e.g. Clerk) via
  // `registerAccessTokenProvider()` so that tokens are provided explicitly.
  // If no external provider is registered, fall back to persisted tokens in localStorage.

  // Show a single warning in dev when no provider is registered to help migration.
  try {
    if (!externalAccessTokenProvider && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[token] no external access token provider registered; falling back to persisted tokens. Register a provider with registerAccessTokenProvider() (recommended).'
      );
    }
  } catch {
    // ignore logging failures
  }
  // 3) fallback to stored tokens
  try {
    const t = loadTokens();
    return t.accessToken ?? null;
  } catch {
    return null;
  }
}

// Attempt to refresh tokens by calling backend /api/auth/refresh
// If an external provider is registered (Clerk), try it first since Clerk manages refresh internally.
export async function refreshTokens(apiBase: string): Promise<string | null> {
  // If a refresh is already in flight, await and reuse it
  if (refreshInFlight) return await refreshInFlight;

  // Otherwise create a shared in-flight promise
  refreshInFlight = (async () => {
    // If external provider exists, try to obtain a fresh token from it first
    try {
      if (externalAccessTokenProvider) {
        const t = await externalAccessTokenProvider();
        if (t) return t;
      }
    } catch {
      // ignore and fall back to backend refresh
    }

    const refresh = getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await fetch(`${apiBase.replace(/\/+$/, '')}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      if (!json || !json.data) return null;
      const accessToken = json.data.accessToken;
      const refreshToken = json.data.refreshToken ?? refresh;
      setTokens({ accessToken, refreshToken });
      return accessToken ?? null;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
