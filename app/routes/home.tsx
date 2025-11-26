import type { Route } from './+types/home';
import { useNavigate } from 'react-router';
import { PageShell } from '../components/page-shell';
import { FadeIn, HoverLift, SlideUp } from '../components/animation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { gameRegistry } from '../data/game-registry';
import { useI18n } from '../i18n/i18n-provider';
import { getPageMeta } from '../i18n/page-copy';

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('home');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Home() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const homeCopy = messages.home;

  return (
    <PageShell title={homeCopy.meta.title} description={homeCopy.meta.description}>
      <Card className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)]">
        <CardContent className="grid gap-8 p-8 md:grid-cols-2 md:items-center">
          <FadeIn className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {homeCopy.seasonTag}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">{homeCopy.heroTitle}</h1>
            <p className="text-lg text-[var(--color-muted)]">{homeCopy.heroDescription}</p>
            <div className="flex flex-wrap gap-3">
              <HoverLift>
                <Button size="lg" onClick={() => navigate('/games')}>
                  {homeCopy.primaryCta}
                </Button>
              </HoverLift>
              <HoverLift>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  {homeCopy.secondaryCta}
                </Button>
              </HoverLift>
            </div>
          </FadeIn>
          <SlideUp>
            <Card className="border-[color:var(--color-border)] bg-[var(--color-surface)]">
              <CardContent className="p-6">
                <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                  {homeCopy.highlightsTitle}
                </p>
                <ul className="mt-4 space-y-4">
                  {homeCopy.highlightsMatches.map((match) => (
                    <li key={match.confrontation} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{match.confrontation}</p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {homeCopy.highlightsSubtitle}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 font-semibold text-[var(--color-primary)]">
                        {match.odd}
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
        {homeCopy.statsCards.map((card, index) => (
          <FadeIn key={card.label} delay={index * 0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-[var(--color-muted)]">{card.trend}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>{homeCopy.activity.title}</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">{homeCopy.activity.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {homeCopy.activity.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface-muted)] p-4 md:grid-cols-[auto,1fr]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{item.action}</p>
                    <p className="text-sm text-[var(--color-muted)]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>{homeCopy.recommendations.title}</CardTitle>
              <p className="text-sm text-[var(--color-muted)]">
                {homeCopy.recommendations.subtitle}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameRegistry.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase text-[var(--color-muted)]">{game.category}</p>
                      <h3 className="text-lg font-semibold">
                        {game.icon} {game.name}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/games/${game.slug}`)}
                    >
                      {homeCopy.recommendations.openCta}
                    </Button>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">{game.overview}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageShell>
  );
}
