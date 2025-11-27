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

  // 2) try heuristics for Clerk when available on window
  try {
    if (isBrowser()) {
      const w = window as unknown as Record<string, unknown>;
      const ClerkCandidate = (w['Clerk'] ?? w['clerk']) as unknown;
      if (ClerkCandidate) {
        const getTokenCandidate = (ClerkCandidate as Record<string, unknown>)['getToken'];
        if (typeof getTokenCandidate === 'function') {
          try {
            const t = await (
              getTokenCandidate as (...args: unknown[]) => Promise<unknown> | unknown
            )();
            if (t && typeof t === 'string') return t;
          } catch {
            // ignore
          }
        }

        const sessionCandidate = (ClerkCandidate as Record<string, unknown>)['session'];
        if (sessionCandidate) {
          const sessionGetToken = (sessionCandidate as Record<string, unknown>)['getToken'];
          if (typeof sessionGetToken === 'function') {
            try {
              const t = await (
                sessionGetToken as (...args: unknown[]) => Promise<unknown> | unknown
              )();
              if (t && typeof t === 'string') return t;
            } catch {
              // ignore
            }
          }
        }
      }
    }
  } catch {
    // ignore
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
  // If external provider exists, try to obtain a fresh token from it
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
}
