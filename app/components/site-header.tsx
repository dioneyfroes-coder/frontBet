import { memo } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/react-router';
import { NavLink, useNavigate } from 'react-router';
import { ThemeSwitcher } from '../theme/theme-switcher';
import { Button } from './ui/button';
import { useI18n } from '../i18n/i18n-provider';
import { LanguageSwitcher } from '../i18n/language-switcher';

function SiteHeaderComponent() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
            FrontBet
          </NavLink>
          <span className="hidden rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)] sm:inline-flex">
            {t('header.betaTag')}
          </span>
        </div>

        <div className="hidden flex-1 items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-muted)] sm:flex">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
            focusable="false"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder={t('header.searchPlaceholder')}
            className="w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                {t('header.login')}
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/perfil')}>
              {t('header.dashboard')}
            </Button>
          </SignedIn>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export const SiteHeader = memo(SiteHeaderComponent);
SiteHeader.displayName = 'SiteHeader';
