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

    // We prefer to only trigger a full logout/redirect for explicit sign-out events.
    // For session changes we only clear persisted tokens to avoid redirect loops while Clerk
    // rehydrates or rotates tokens during normal operation.
    const signOutHandler = () => {
      try {
        void handleLogout();
      } catch {
        // ignore
      }
    };

    const sessionChangedHandler = () => {
      try {
        // Clear persisted tokens but do not force a redirect; Clerk will manage client session.
        // This avoids a brief redirect to `/login` when Clerk is still initializing.
        try {
          setTokens({ accessToken: null, refreshToken: null });
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    };

    let attached = false;
    let wrapper: ((ev?: unknown) => void) | null = null;
    try {
      if (typeof c.on === 'function') {
        // attach to specific events for clearer intent
        c.on('signOut', signOutHandler);
        c.on('signedOut', signOutHandler);
        c.on('sessionChanged', sessionChangedHandler);
        attached = true;
      } else if (typeof c.addListener === 'function') {
        // `addListener` may emit a variety of events; attach a defensive wrapper that
        // only triggers a full logout when the event indicates an explicit sign-out.
        wrapper = (ev?: unknown) => {
          try {
            // When `addListener` is used and no event payload is provided, treat it
            // as an explicit sign-out (preserves previous behavior where addListener
            // invoked the logout handler directly).
            if (!ev) return signOutHandler();
            // if event appears to be a string name, handle common names
            if (typeof ev === 'string') {
              if (ev === 'signOut' || ev === 'signedOut') return signOutHandler();
              return sessionChangedHandler();
            }
            // If event has a `type` property, use it to decide
            if (
              typeof ev === 'object' &&
              ev !== null &&
              'type' in (ev as Record<string, unknown>)
            ) {
              const t = (ev as Record<string, unknown>).type as unknown as string;
              if (t === 'signOut' || t === 'signedOut') return signOutHandler();
              return sessionChangedHandler();
            }
            // default fallback
            return sessionChangedHandler();
          } catch {
            // ignore
          }
        };
        c.addListener(wrapper);
        attached = true;
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        registerAccessTokenProvider(null);
        if (attached) {
          if (typeof c.removeListener === 'function' && wrapper) c.removeListener(wrapper);
          if (typeof c.off === 'function') {
            try {
              c.off('signOut', signOutHandler);
            } catch {
              /* ignore */
            }
            try {
              c.off('signedOut', signOutHandler);
            } catch {
              /* ignore */
            }
            try {
              c.off('sessionChanged', sessionChangedHandler);
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        /* ignore */
      }
    };
  }, [clerk]);

  return null;
}
