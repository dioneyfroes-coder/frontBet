import type { Route } from './+types/auditoria';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FadeIn } from '../components/animation';
import { requireAuth } from '../utils/auth.server';
import { Button } from '../components/ui/button';
import { useI18n } from '../i18n/i18n-provider';
import { getPageMeta } from '../i18n/page-copy';
import type { AuditCopy } from '../types/i18n';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('audit');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Auditoria() {
  const { messages } = useI18n();
  const auditCopy: AuditCopy = messages.audit;
  return (
    <PageShell title={auditCopy.title} description={auditCopy.description}>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{auditCopy.cardTitle}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {auditCopy.exportCta}
            </Button>
            <Button size="sm">{auditCopy.filterCta}</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {auditCopy.entries.map((registro, index) => (
            <FadeIn
              key={registro.id}
              delay={index * 0.05}
              className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-[1fr,1fr,1fr,1fr,auto]"
            >
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">
                  {auditCopy.columns.id}
                </p>
                <p className="font-semibold">{registro.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">
                  {auditCopy.columns.action}
                </p>
                <p className="font-semibold">{registro.action}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">
                  {auditCopy.columns.amount}
                </p>
                <p>{registro.amount}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">
                  {auditCopy.columns.status}
                </p>
                <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
                  {registro.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-[var(--color-muted)]">
                  {auditCopy.columns.recordedAt}
                </p>
                <p className="font-semibold">{registro.timestamp}</p>
                <p className="text-xs text-[var(--color-muted)]">{registro.agent}</p>
              </div>
            </FadeIn>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}

export async function loader(args: Route.LoaderArgs) {
  await requireAuth(args);
  return {};
}
