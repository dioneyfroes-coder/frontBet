'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/react-router';
import { registerAccessTokenProvider, setTokens, handleLogout } from '../lib';

export default function ClerkTokenRegistrar() {
  const clerk = useClerk?.();

  useEffect(() => {
    if (!clerk) return;
    // register provider that returns Clerk's token
    registerAccessTokenProvider(() => {
      try {
        const c = clerk as unknown as {
          getToken?: () => Promise<string> | string;
          session?: { getToken?: () => Promise<string> | string };
        };
        // Clerk API: getToken() returns a Promise<string> or string
        if (typeof c?.getToken === 'function') {
          return c.getToken();
        }
        // fallback: try session.getToken
        if (c?.session && typeof c.session.getToken === 'function') {
          return c.session.getToken();
        }
      } catch {
        // ignore
      }
      return null;
    });

    // Try to proactively fetch and persist token on mount so localStorage stays in sync
    (async function syncInitialToken() {
      try {
        const c = clerk as unknown as {
          getToken?: () => Promise<string> | string;
          session?: { getToken?: () => Promise<string> | string };
        };
        let token: string | null = null;
        if (typeof c?.getToken === 'function') {
          const t = await c.getToken();
          if (t && typeof t === 'string') token = t;
        }
        if (!token && c?.session && typeof c.session.getToken === 'function') {
          const t = await c.session.getToken();
          if (t && typeof t === 'string') token = t;
        }
        if (token) {
          try {
            setTokens({ accessToken: token });
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    })();

    // try to attach sign-out/session listeners so we can clear persisted tokens
    const c = clerk as unknown as {
      addListener?: (cb: (ev?: unknown) => void) => void;
      on?: (ev: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (cb: (ev?: unknown) => void) => void;
      off?: (ev: string, cb: (...args: unknown[]) => void) => void;
      // fallback shape
      session?: unknown;
    };

    const handler = () => {
      try {
        // Delegate to centralized logout handler so behavior is consistent across app
        void handleLogout();
      } catch {
        // ignore
      }
    };

    let attached = false;
    try {
      if (typeof c.addListener === 'function') {
        c.addListener(handler);
        attached = true;
      } else if (typeof c.on === 'function') {
        // attach to a few common event names
        c.on('signOut', handler);
        c.on('signedOut', handler);
        c.on('sessionChanged', handler);
        attached = true;
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        registerAccessTokenProvider(null);
        if (attached) {
          if (typeof c.removeListener === 'function') c.removeListener(handler);
          if (typeof c.off === 'function') {
            c.off('signOut', handler);
            c.off('signedOut', handler);
            c.off('sessionChanged', handler);
          }
        }
      } catch {
        /* ignore */
      }
    };
  }, [clerk]);

  return null;
}
