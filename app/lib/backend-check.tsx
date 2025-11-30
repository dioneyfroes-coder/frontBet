import { useEffect, useRef } from 'react';
import { useToast } from '../components/ToastProvider';

export type BackendCheckOptions = {
  endpoint?: string; // relative path to ping, default '/api/health'
  intervalMs?: number | null; // if provided, poll at this interval (ms). null = only once
  toastMessage?: string; // message to show on successful connection
  showOnce?: boolean; // only show toast once (default true)
  timeoutMs?: number; // fetch timeout in ms
  enabled?: boolean; // allow easily toggling the module off
  debugShowTestToast?: boolean; // show a test toast on mount (debug)
};

export async function checkBackend(endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/health`, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * BackendHealthNotifier
 *
 * Small, easy-to-add component that pings a configurable backend endpoint and
 * shows a success toast when the connection is confirmed. It is intentionally
 * lightweight so it can be added/removed easily (place it in `app/root.tsx` or
 * any top-level layout).
 */
export default function BackendHealthNotifier({
  endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/health`,
  intervalMs = null,
  toastMessage = 'Conexão com backend estabelecida',
  showOnce = true,
  timeoutMs = 5000,
  enabled = true,
  // for debugging: show a test toast on mount so developers can verify toasts
  debugShowTestToast = false,
}: BackendCheckOptions) {
  const { show } = useToast();
  const shownRef = useRef(false);
  useEffect(() => {
    if (!enabled) return undefined;

    try {
      if (typeof console !== 'undefined' && typeof console.debug === 'function') {
        console.debug(`[backend-check] initialized (endpoint=${endpoint}, intervalMs=${String(intervalMs)})`);
      }
    } catch (e) {
      void e;
    }

    if (debugShowTestToast) {
      try {
        show('Backend check initialized (debug)', 'info');
      } catch (e) {
        void e;
      }
    }

    let mounted = true;

    const runCheck = async () => {
      try {
        const res = await checkBackend(endpoint, timeoutMs);
        if (!mounted) return;
        if (res && res.ok) {
          // debug log so developers can see the successful check in console
          try {
            if (typeof console !== 'undefined' && typeof console.debug === 'function') {
              console.debug(`[backend-check] backend reachable: ${endpoint} (status=${res.status})`);
            }
          } catch (e) {
            void e;
          }
          if (!showOnce || !shownRef.current) {
            shownRef.current = true;
            show(toastMessage, 'info');
          }
        }
      } catch (err) {
        // Log failure to console to help debugging when no toast appears
        try {
          if (typeof console !== 'undefined' && typeof console.debug === 'function') {
            console.debug(`[backend-check] check failed: ${endpoint}`, err);
          }
        } catch (e) {
          void e;
        }
        // Swallow errors here — this module only notifies on success.
      }
    };

    // initial check
    runCheck();

    let timer: NodeJS.Timeout | null = null;
    if (intervalMs && intervalMs > 0) {
      timer = setInterval(runCheck, intervalMs);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [endpoint, intervalMs, toastMessage, showOnce, timeoutMs, enabled, show, debugShowTestToast]);

  return null;
}
