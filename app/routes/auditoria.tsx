import type { Route } from './+types/auditoria';
import { PageShell } from '../components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FadeIn } from '../components/animation';
import { requireAuth } from '../utils/auth.server';
import { Button } from '../components/ui/button';

const registros = [
  {
    id: 'AUD-9823',
    acao: 'Saque PIX',
    valor: 'R$ 300,00',
    status: 'Aprovado',
    data: '23/11/2025 18:17',
    responsavel: 'Sistema',
  },
  {
    id: 'AUD-9812',
    acao: 'Depósito PIX',
    valor: 'R$ 500,00',
    status: 'Concluído',
    data: '24/11/2025 22:08',
    responsavel: 'Usuário',
  },
  {
    id: 'AUD-9755',
    acao: 'Limite diário alterado',
    valor: 'R$ 1.500,00',
    status: 'Revisão',
    data: '21/11/2025 14:53',
    responsavel: 'Analista',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Auditoria - FrontBet' },
    {
      name: 'description',
      content: 'Logs completos de ações sensíveis como saques e ajustes de limite.',
    },
  ];
}

export default function Auditoria() {
  return (
    <PageShell
      title="Auditoria"
      description="Cada saque, depósito ou alteração relevante fica registrado com horário, responsável e status de verificação."
    >
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Logs monitorados</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Exportar CSV
            </Button>
            <Button size="sm">Filtrar</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {registros.map((registro, index) => (
            <FadeIn
              key={registro.id}
              delay={index * 0.05}
              className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-[1fr,1fr,1fr,1fr,auto]"
            >
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">ID</p>
                <p className="font-semibold">{registro.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">Ação</p>
                <p className="font-semibold">{registro.acao}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">Valor</p>
                <p>{registro.valor}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">Status</p>
                <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
                  {registro.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-[var(--color-muted)]">Registro</p>
                <p className="font-semibold">{registro.data}</p>
                <p className="text-xs text-[var(--color-muted)]">{registro.responsavel}</p>
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
