import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SiteHeader } from '../site-header';
import { I18nProvider } from '../../i18n/i18n-provider';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@clerk/react-router', () => ({
  SignedIn: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock('../../theme/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock('../../i18n/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('SiteHeader', () => {
  it('shows brand, search and action buttons', () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="pt-BR">
          <SiteHeader />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'FrontBet' })).toHaveAttribute('href', '/');
    expect(screen.getByPlaceholderText(/Buscar jogos/)).toBeInTheDocument();
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Painel' })).toBeInTheDocument();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });
});
