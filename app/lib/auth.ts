import { clearTokens } from './token';

export type LogoutHandler = () => void | Promise<void>;

// Default logout handler: clear persisted tokens and redirect to `/login` in browsers
let handler: LogoutHandler = async () => {
  try {
    clearTokens();
  } catch {
    // ignore
  }
  try {
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.replace('/login');
    }
  } catch {
    // ignore non-browser environments
  }
};

// Prevent repeated logout/redirect loops by tracking whether a logout is already in progress.
let isLoggingOut = false;

export function setLogoutHandler(h: LogoutHandler | null) {
  if (h == null) {
    // reset to default
    handler = async () => {
      try {
        clearTokens();
      } catch {
        // ignore
      }
      try {
        if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
          window.location.replace('/login');
        }
      } catch {
        // ignore
      }
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
