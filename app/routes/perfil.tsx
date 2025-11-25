import type { Route } from './+types/perfil';
import { PageShell } from '../components/page-shell';
import { FadeIn, SlideUp } from '../components/animation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { requireAuth } from '../utils/auth.server';

const stats = [
  { label: 'Banca atual', value: 'R$ 2.450,00' },
  { label: 'Lucro no mês', value: '+18%' },
  { label: 'Palpites ativos', value: '6' },
];

const historico = [
  { evento: 'Brasileirão - Vitória do Bahia', status: 'Ganho', odd: '2.30' },
  { evento: 'Libertadores - +2.5 gols', status: 'Em aberto', odd: '1.90' },
  { evento: 'NBA - Handicap Celtics', status: 'Perdido', odd: '1.85' },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Perfil - FrontBet' },
    {
      name: 'description',
      content: 'Acompanhe seu desempenho, histórico e limites personalizados dentro da FrontBet.',
    },
  ];
}

export default function Perfil() {
  return (
    <PageShell
      title="Seu painel"
      description="Resumo financeiro, limites personalizados e histórico recente de apostas."
    >
      <section className="grid gap-6 md:grid-cols-3">
        {stats.map((item, index) => (
          <FadeIn key={item.label} delay={index * 0.1}>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-[var(--color-muted)]">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </section>

      <SlideUp>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Histórico recente</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">Últimas movimentações do mês</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Ver completo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {historico.map((item) => (
              <div
                key={item.evento}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--color-border)] pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.evento}</p>
                  <p className="text-sm text-[var(--color-muted)]">Odd {item.odd}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    item.status === 'Ganho'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : item.status === 'Perdido'
                        ? 'bg-rose-500/20 text-rose-500'
                        : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="text-xs text-[var(--color-muted)]">
            Odds e status são ilustrativos e atualizam automaticamente na plataforma real.
          </CardFooter>
        </Card>
      </SlideUp>
    </PageShell>
  );
}

export async function loader(args: Route.LoaderArgs) {
  await requireAuth(args);
  return {};
}
