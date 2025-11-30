import React from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { ClerkProvider } from '@clerk/react-router';
import { rootAuthLoader } from '@clerk/react-router/server';

import ClerkTokenRegistrar from './components/clerk-token-registrar';
import ToastProvider, { useToast } from './components/ToastProvider';
import { BackendHealthNotifier } from './lib';
import { setErrorHandler } from './lib/error';
import { setLogoutHandler } from './lib/auth';

import type { Route } from './+types/root';
import './app.css';
import { ThemeProvider } from './theme/theme-provider';
import { I18nProvider, useI18n } from './i18n/i18n-provider';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans antialiased">
        <I18nProvider>
          <ThemeProvider>
            <SkipLink />
            {children}
          </ThemeProvider>
        </I18nProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = (args: Route.LoaderArgs) =>
  rootAuthLoader(args, {
    signInUrl: '/login',
  });

function RootApp({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <ToastProvider>
        <ErrorHandlerRegistrar />
        <ClerkTokenRegistrar />
        <BackendHealthNotifier
          endpoint="/api/health"
          intervalMs={60000}
          enabled={process.env.NODE_ENV !== 'production'}
          debugShowTestToast={true}
        />
        <Outlet />
      </ToastProvider>
    </ClerkProvider>
  );
}

function ErrorHandlerRegistrar() {
  const { show } = useToast();

  React.useEffect(() => {
    // ensure the logout handler defaults to built-in behavior unless app overrides
    setLogoutHandler(null);
  }, []);

  React.useEffect(() => {
    setErrorHandler(async (err) => {
      try {
        type ErrorContext = { time: string; path?: string; userId?: string };
        const ctx: ErrorContext = {
          time: new Date().toISOString(),
          path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        };

        // Attempt to glean Clerk user id from window if available
        try {
          const w =
            typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
          const clerkCandidate = w ? (w['Clerk'] ?? w['clerk']) : null;
          if (clerkCandidate && typeof clerkCandidate === 'object') {
            const cc = clerkCandidate as Record<string, unknown>;
            const session = cc['session'];
            const user = cc['user'];
            try {
              const uid =
                (session && typeof session === 'object'
                  ? (session as Record<string, unknown>)['userId']
                  : undefined) ??
                (user && typeof user === 'object'
                  ? (user as Record<string, unknown>)['id']
                  : undefined);
              if (uid && typeof uid === 'string') ctx.userId = uid;
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }

        // Show a simple toast to the user
        try {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          show(message, 'error');
        } catch {
          // ignore
        }

        // Try to forward to Sentry if DSN available and @sentry/react installed
        try {
          const dsn =
            import.meta.env.VITE_SENTRY_DSN ||
            import.meta.env.SENTRY_DSN ||
            (process.env as unknown as Record<string, string>).SENTRY_DSN;
          if (dsn) {
            try {
              const SentryModule = (await import('@sentry/react')) as unknown as {
                init: (opts: { dsn: string }) => void;
                captureException?: (e: unknown, ctx?: unknown) => void;
              };
              SentryModule.init({ dsn });
              SentryModule.captureException?.(err, { extra: ctx });
            } catch {
              // ignore if not installed
            }
          }
        } catch {
          // ignore
        }

        // Try to forward to LogRocket if available
        try {
          const lrApp =
            import.meta.env.VITE_LOGROCKET_APP ||
            import.meta.env.LOGROCKET_APP ||
            (process.env as unknown as Record<string, string>).LOGROCKET_APP;
          if (lrApp) {
            try {
              const LogRocketModule = (await import('logrocket')) as unknown as {
                init: (app: string) => void;
                captureException?: (e: unknown) => void;
              };
              LogRocketModule.init(lrApp);
              LogRocketModule.captureException?.(err as unknown);
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }
      } catch {
        // swallow errors from handler
      }
    });
  }, [show]);

  return null;
}

export default RootApp;

function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="skip-link">
      {t('common.skipToContent')}
    </a>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="main" className="pt-16 p-4 container mx-auto text-[var(--color-text)]">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
