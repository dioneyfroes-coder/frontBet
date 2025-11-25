import { NavLink, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { HoverLift } from './animation';

const sidebarNav = [
  { label: 'Visão geral', to: '/' },
  { label: 'Jogos', to: '/jogos' },
  { label: 'Loja', to: '/loja' },
  { label: 'Perfil', to: '/perfil' },
  { label: 'Atividade', to: '/perfil/atividade' },
  { label: 'Auditoria', to: '/auditoria' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
];

const quickActions = [
  { label: 'Depositar PIX', to: '/perfil' },
  { label: 'Explorar promoções', to: '/loja' },
];

export function SiteSidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="sticky top-24 hidden w-64 flex-shrink-0 flex-col gap-6 lg:flex"
      aria-label="Menu principal"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navegação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {sidebarNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {item.label}
            </NavLink>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atalhos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <HoverLift key={action.label}>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate(action.to)}
              >
                {action.label}
              </Button>
            </HoverLift>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

export function SiteNavMobile() {
  return (
    <div
      className="-mx-4 mb-4 overflow-x-auto border-b border-[color:var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:hidden"
      aria-label="Menu mobile"
    >
      <div className="flex w-max gap-2">
        {sidebarNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
                  : 'border border-[color:var(--color-border)] text-[var(--color-muted)]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
