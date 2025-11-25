import type { Route } from './+types/home';
import { useNavigate } from 'react-router';
import { PageShell } from '../components/page-shell';
import { FadeIn, HoverLift, SlideUp } from '../components/animation';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const features = [
  {
    title: 'Probabilidades dinâmicas',
    description: 'Atualizações em tempo real com base em mercados nacionais e internacionais.',
  },
  {
    title: 'Construção de bilhetes',
    description: 'Monte múltiplas seleções com boosts automáticos e limites inteligentes.',
  },
  {
    title: 'Alertas personalizados',
    description: 'Defina gatilhos de odd e receba notificações instantâneas no app ou desktop.',
  },
];

const destaques = [
  { confronto: 'Corinthians x Santos', odd: '1.95' },
  { confronto: 'Fluminense x Atlético-MG', odd: '2.45' },
  { confronto: 'Internacional x Grêmio', odd: '2.85' },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'FrontBet - Palpites inteligentes' },
    {
      name: 'description',
      content: 'Site de apostas focado em experiência mobile, insights e apostas responsáveis.',
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <Card className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)]">
        <CardContent className="grid gap-8 p-8 md:grid-cols-2 md:items-center">
          <FadeIn className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Nova temporada 2025
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              FrontBet, o front-end das suas apostas
            </h1>
            <p className="text-lg text-[var(--color-muted)]">
              Crie bilhetes em segundos, acompanhe estatísticas avançadas e gerencie limites de
              forma transparente.
            </p>
            <div className="flex flex-wrap gap-3">
              <HoverLift>
                <Button size="lg" onClick={() => navigate('/jogos')}>
                  Ver jogos
                </Button>
              </HoverLift>
              <HoverLift>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
              </HoverLift>
            </div>
          </FadeIn>
          <SlideUp>
            <Card className="border-[color:var(--color-border)] bg-[var(--color-surface)]">
              <CardContent className="p-6">
                <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                  Destaques ao vivo
                </p>
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
              </CardContent>
            </Card>
          </SlideUp>
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <FadeIn key={feature.title} delay={index * 0.1}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{feature.title}</h2>
                <p className="mt-2 text-[var(--color-muted)]">{feature.description}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </section>
    </PageShell>
  );
}
