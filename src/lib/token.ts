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

export function getAccessToken(): string | null {
  const t = loadTokens();
  return t.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  const t = loadTokens();
  return t.refreshToken ?? null;
}

// Attempt to refresh tokens by calling backend /api/auth/refresh
export async function refreshTokens(apiBase: string): Promise<string | null> {
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
