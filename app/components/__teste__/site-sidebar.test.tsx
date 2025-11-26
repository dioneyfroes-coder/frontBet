import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SiteSidebar, SiteNavMobile } from '../site-sidebar';
import { I18nProvider } from '../../i18n/i18n-provider';
import { gameRegistry } from '../../data/game-registry';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../animation', () => ({
  HoverLift: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('SiteSidebar', () => {
  it('renders base navigation items and registry links', () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="pt-BR">
          <SiteSidebar />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Visão geral' })).toBeInTheDocument();
    const dynamicLabel = `${gameRegistry[0].icon} ${gameRegistry[0].name}`;
    expect(screen.getByText(dynamicLabel)).toBeInTheDocument();
  });

  it('triggers navigation via quick actions', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="pt-BR">
          <SiteSidebar />
        </I18nProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Depositar PIX' }));
    expect(mockNavigate).toHaveBeenCalledWith('/carteira');
  });
});

describe('SiteNavMobile', () => {
  it('renders horizontal navigation pills', () => {
    render(
      <MemoryRouter>
        <I18nProvider initialLocale="pt-BR">
          <SiteNavMobile />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Loja' })).toBeInTheDocument();
  });
});
