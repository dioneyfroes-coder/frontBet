import type { Route } from "./+types/home";
import { Link } from "react-router";
import { PageShell } from "../components/page-shell";

const features = [
  {
    title: "Probabilidades dinâmicas",
    description: "Atualizações em tempo real com base em mercados nacionais e internacionais.",
  },
  {
    title: "Construção de bilhetes",
    description: "Monte múltiplas seleções com boosts automáticos e limites inteligentes.",
  },
  {
    title: "Alertas personalizados",
    description: "Defina gatilhos de odd e receba notificações instantâneas no app ou desktop.",
  },
];

const destaques = [
  { confronto: "Corinthians x Santos", odd: "1.95" },
  { confronto: "Fluminense x Atlético-MG", odd: "2.45" },
  { confronto: "Internacional x Grêmio", odd: "2.85" },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FrontBet - Palpites inteligentes" },
    {
      name: "description",
      content: "Site de apostas focado em experiência mobile, insights e apostas responsáveis.",
    },
  ];
}

export default function Home() {
  return (
    <PageShell>
      <section className="rounded-3xl border border-[color:var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)] p-8 shadow-lg">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Nova temporada 2025
            </p>
            <h1 className="text-4xl font-bold tracking-tight">FrontBet, o front-end das suas apostas</h1>
            <p className="text-lg text-[var(--color-muted)]">
              Crie bilhetes em segundos, acompanhe estatísticas avançadas e gerencie limites de forma transparente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/jogos"
                className="rounded-full bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-bg)]"
              >
                Ver jogos
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-[color:var(--color-border)] px-6 py-3 font-semibold"
              >
                Entrar
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">Destaques ao vivo</p>
            <ul className="mt-4 space-y-4">
              {destaques.map((jogo) => (
                <li key={jogo.confronto} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{jogo.confronto}</p>
                    <p className="text-sm text-[var(--color-muted)]">Odd combinada</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 font-semibold text-[var(--color-primary)]">
                    {jogo.odd}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <h2 className="text-xl font-semibold">{feature.title}</h2>
            <p className="mt-2 text-[var(--color-muted)]">{feature.description}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
