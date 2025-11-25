import type { Route } from './+types/perfil.atividade';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FadeIn } from '../components/animation';
import { requireAuth } from '../utils/auth.server';

const eventos = [
  {
    tipo: 'Login',
    descricao: 'Sessão autenticada com sucesso',
    data: '25/11/2025 09:12',
    dispositivo: 'Chrome · São Paulo',
  },
  {
    tipo: 'Depósito',
    descricao: 'PIX recebido - R$ 500,00',
    data: '24/11/2025 22:08',
    dispositivo: 'Mobile · Recife',
  },
  {
    tipo: 'Configuração',
    descricao: '2FA habilitada via app autenticador',
    data: '24/11/2025 21:45',
    dispositivo: 'Chrome · São Paulo',
  },
  {
    tipo: 'Saque',
    descricao: 'Solicitação de saque PIX - R$ 300,00',
    data: '23/11/2025 18:17',
    dispositivo: 'Chrome · Curitiba',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Atividade recente - FrontBet' },
    { name: 'description', content: 'Monitore logins, depósitos e ações sensíveis em tempo real.' },
  ];
}

export default function AtividadeRecente() {
  return (
    <PageShell
      title="Atividade recente"
      description="Tudo que aconteceu na sua conta nos últimos dias. Receba alertas em tempo real sempre que algo sensível for executado."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventos.map((evento, index) => (
            <FadeIn
              key={evento.data}
              delay={index * 0.05}
              className="flex items-start gap-4 border-b border-[color:var(--color-border)] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-hidden />
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                  {evento.tipo}
                </p>
                <p className="text-lg font-semibold">{evento.descricao}</p>
                <p className="text-sm text-[var(--color-muted)]">{evento.dispositivo}</p>
              </div>
              <time className="text-xs text-[var(--color-muted)]">{evento.data}</time>
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
