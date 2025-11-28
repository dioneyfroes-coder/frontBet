import * as tokenModule from './token';

export type LogoutHandler = () => void | Promise<void>;

// Default logout handler: clear persisted tokens and redirect to `/login` in browsers
// Default behavior split into two functions for better testability and to allow
// callers (e.g. Clerk) to clear auth state without forcing a redirect.
export function clearAuthState() {
  try {
    tokenModule.clearTokens();
  } catch {
    // ignore
  }
}

export function redirectToLogin() {
  try {
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.replace('/login');
    }
  } catch {
    // ignore non-browser environments
  }
}

let handler: LogoutHandler = async () => {
  clearAuthState();
  redirectToLogin();
};

// Prevent repeated logout/redirect loops by tracking whether a logout is already in progress.
let isLoggingOut = false;

export function setLogoutHandler(h: LogoutHandler | null) {
  if (h == null) {
    // reset to default
    handler = async () => {
      clearAuthState();
      redirectToLogin();
    };
  } else {
    handler = h;
  }
}

export async function handleLogout() {
  if (isLoggingOut) return;
  // If already on the login page, skip logout to avoid reload/redirect loops.
  try {
    if (typeof window !== 'undefined' && window.location && window.location.pathname === '/login') {
      return;
    }
  } catch {
    // ignore
  }

  isLoggingOut = true;
  try {
    await handler();
  } catch {
    // swallow errors to avoid breaking callers
  }
}

export default {
  setLogoutHandler,
  handleLogout,
};
