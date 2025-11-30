import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import type { Route } from './+types/perfil.atividade';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FadeIn } from '../components/animation';
import { Input } from '../components/ui/input';
import { requireAuth } from '../utils/auth.server';
import { useI18n } from '../i18n/i18n-provider';
import { getPageMeta } from '../i18n/page-copy';
import { formatMessage } from '../lib/config';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('activity');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function AtividadeRecente() {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const [isFiltering, startFilteringTransition] = useTransition();
  const { messages } = useI18n();
  const activityCopy = messages.activity;
  const eventTypes = useMemo(
    () => Array.from(new Set(activityCopy.events.map((event) => event.type))),
    [activityCopy.events]
  );
  const [activeType, setActiveType] = useState<'todos' | (typeof eventTypes)[number]>('todos');

  const filteredEvents = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return activityCopy.events.filter((event) => {
      const matchesType = activeType === 'todos' || event.type === activeType;
      if (!matchesType) {
        return false;
      }
      if (!term) {
        return true;
      }
      const haystack = `${event.type} ${event.description} ${event.device}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [activeType, deferredSearch, activityCopy.events]);

  const handleTypeChange = (type: 'todos' | (typeof eventTypes)[number]) => {
    startFilteringTransition(() => setActiveType(type));
  };

  return (
    <PageShell title={activityCopy.title} description={activityCopy.description}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{activityCopy.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Input
                label={activityCopy.searchLabel}
                placeholder={activityCopy.searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="text-sm text-[var(--color-muted)]">
              {isFiltering
                ? activityCopy.filtering
                : formatMessage(activityCopy.totalTemplate, { count: filteredEvents.length })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['todos', ...eventTypes].map((typeOption) => (
              <button
                key={typeOption}
                type="button"
                aria-pressed={activeType === typeOption}
                onClick={() =>
                  handleTypeChange(typeOption as 'todos' | (typeof eventTypes)[number])
                }
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeType === typeOption
                    ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[color:var(--color-border)] text-[var(--color-muted)] hover:border-[color:var(--color-primary)]/30'
                }`}
              >
                {typeOption === 'todos' ? activityCopy.filters.todos : typeOption}
              </button>
            ))}
          </div>
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-sm text-[var(--color-muted)]">
              {activityCopy.emptyState}
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <FadeIn
                key={`${event.timestamp}-${event.type}`}
                delay={index * 0.05}
                className="flex items-start gap-4 border-b border-[color:var(--color-border)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                    {event.type}
                  </p>
                  <p className="text-lg font-semibold">{event.description}</p>
                  <p className="text-sm text-[var(--color-muted)]">{event.device}</p>
                </div>
                <time className="text-xs text-[var(--color-muted)]">{event.timestamp}</time>
              </FadeIn>
            ))
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

export async function loader(args: Route.LoaderArgs) {
  await requireAuth(args);
  return {};
}
