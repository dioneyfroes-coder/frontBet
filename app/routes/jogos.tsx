import type { Route } from "./+types/jogos";
import { PageShell } from "../components/page-shell";

const jogos = [
  {
    liga: "Brasileirão",
    partidas: [
      { confronto: "Flamengo x Palmeiras", oddCasa: "1.95", oddEmpate: "3.20", oddFora: "3.60" },
      { confronto: "Bahia x Fortaleza", oddCasa: "2.35", oddEmpate: "3.10", oddFora: "3.00" },
    ],
  },
  {
    liga: "Champions League",
    partidas: [
      { confronto: "Real Madrid x City", oddCasa: "2.50", oddEmpate: "3.40", oddFora: "2.60" },
      { confronto: "PSG x Bayern", oddCasa: "2.90", oddEmpate: "3.60", oddFora: "2.30" },
    ],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Jogos - FrontBet" },
    {
      name: "description",
      content: "Calendário de partidas com odds ilustrativas para criar seus palpites na FrontBet.",
    },
  ];
}

export default function Jogos() {
  return (
    <PageShell title="Próximos jogos" description="Acompanhe as odds principais e clique para montar seu bilhete.">
      <div className="space-y-6">
        {jogos.map((grupo) => (
          <section
            key={grupo.liga}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{grupo.liga}</h2>
              <button className="text-sm text-[var(--color-primary)]">Ver todas</button>
            </header>
            <div className="space-y-4">
              {grupo.partidas.map((partida) => (
                <article
                  key={partida.confronto}
                  className="grid gap-4 rounded-xl border border-[color:var(--color-border)] p-4 md:grid-cols-[2fr,1fr,1fr,1fr]"
                >
                  <p className="font-medium">{partida.confronto}</p>
                  <div>
                    <p className="text-xs uppercase text-[var(--color-muted)]">Casa</p>
                    <p className="text-lg font-semibold">{partida.oddCasa}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--color-muted)]">Empate</p>
                    <p className="text-lg font-semibold">{partida.oddEmpate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--color-muted)]">Visitante</p>
                    <p className="text-lg font-semibold">{partida.oddFora}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
