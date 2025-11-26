import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { HoverLift } from './animation';
import { gameRegistry } from '../data/game-registry';
import { useI18n } from '../i18n/i18n-provider';

type SidebarNavItem = { to: string; labelKey: string } | { to: string; label: string };

const baseNav: SidebarNavItem[] = [
  { labelKey: 'navigation.overview', to: '/' },
  { labelKey: 'navigation.gamesHub', to: '/games' },
  { labelKey: 'navigation.store', to: '/loja' },
  { labelKey: 'navigation.wallet', to: '/carteira' },
  { labelKey: 'navigation.profile', to: '/perfil' },
  { labelKey: 'navigation.activity', to: '/perfil/atividade' },
  { labelKey: 'navigation.audit', to: '/auditoria' },
  { labelKey: 'navigation.about', to: '/sobre' },
  { labelKey: 'navigation.contact', to: '/contato' },
];

const sidebarNav: SidebarNavItem[] = [
  ...baseNav,
  ...gameRegistry.map((game) => ({
    label: `${game.icon} ${game.name}`,
    to: `/games/${game.slug}`,
  })),
];

const quickActions: Array<{ labelKey: string; to: string }> = [
  { labelKey: 'quickActions.depositPix', to: '/carteira' },
  { labelKey: 'quickActions.explorePromos', to: '/loja' },
];

function SiteSidebarComponent() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <aside
      className="sticky top-24 hidden w-64 flex-shrink-0 flex-col gap-6 lg:flex"
      aria-label={t('common.desktopNavAria')}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sidebar.navigationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {sidebarNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              prefetch="intent"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {'labelKey' in item ? t(item.labelKey) : item.label}
            </NavLink>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sidebar.shortcutsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <HoverLift key={action.labelKey}>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate(action.to)}
              >
                {t(action.labelKey)}
              </Button>
            </HoverLift>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

function SiteNavMobileComponent() {
  const { t } = useI18n();
  return (
    <div
      className="-mx-4 mb-4 overflow-x-auto border-b border-[color:var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:hidden"
      aria-label={t('common.mobileNavAria')}
    >
      <div className="flex w-max gap-2">
        {sidebarNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            prefetch="intent"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
                  : 'border border-[color:var(--color-border)] text-[var(--color-muted)]'
              }`
            }
          >
            {'labelKey' in item ? t(item.labelKey) : item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export const SiteSidebar = memo(SiteSidebarComponent);
SiteSidebar.displayName = 'SiteSidebar';

export const SiteNavMobile = memo(SiteNavMobileComponent);
SiteNavMobile.displayName = 'SiteNavMobile';
