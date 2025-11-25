import type { Route } from './+types/contato';
import { PageShell } from '../components/page-shell';

const contatos = [
  {
    label: 'Suporte 24/7',
    value: 'suporte@frontbet.com',
  },
  {
    label: 'Parcerias',
    value: 'parcerias@frontbet.com',
  },
  {
    label: 'Comercial',
    value: '+55 11 4002-8922',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Contato - FrontBet' },
    {
      name: 'description',
      content: 'Fale com o time FrontBet para suporte, parcerias e oportunidades comerciais.',
    },
  ];
}

export default function Contato() {
  return (
    <PageShell
      title="Fale conosco"
      description="Nossa equipe está disponível todos os dias para tirar dúvidas sobre depósitos, limites, palpite responsável e integrações."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <section className="space-y-4">
          {contatos.map((item) => (
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
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--color-muted)]" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="voce@email.com"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--color-muted)]" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              rows={4}
              placeholder="Conte pra gente como podemos ajudar"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-bg)]"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </PageShell>
  );
}
