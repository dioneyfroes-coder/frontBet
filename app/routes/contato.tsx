import type { Route } from './+types/contato';
import { PageShell } from '../components/page-shell';
import { useI18n } from '../i18n/i18n-provider';
import { getPageMeta } from '../i18n/page-copy';
import type { ContactCopy } from '../types/i18n';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('contact');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Contato() {
  const { messages } = useI18n();
  const copy: ContactCopy = messages.contact;

  return (
    <PageShell title={copy.title} description={copy.description}>
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <section className="space-y-4">
          {copy.channels.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                {item.label}
              </p>
              <p className="text-lg font-semibold">{item.value}</p>
            </article>
          ))}
        </section>
        <form className="space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="space-y-1">
            <label className="text-sm text-[var(--color-muted)]" htmlFor="nome">
              {copy.form.nameLabel}
            </label>
            <input
              id="nome"
              type="text"
              placeholder={copy.form.namePlaceholder}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--color-muted)]" htmlFor="email">
              {copy.form.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              placeholder={copy.form.emailPlaceholder}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--color-muted)]" htmlFor="mensagem">
              {copy.form.messageLabel}
            </label>
            <textarea
              id="mensagem"
              rows={4}
              placeholder={copy.form.messagePlaceholder}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-bg)]"
          >
            {copy.form.submit}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
