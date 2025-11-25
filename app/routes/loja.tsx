import type { Route } from './+types/loja';
import { PageShell } from '../components/page-shell';
import { requireAuth } from '../utils/auth.server';

const produtos = [
  {
    nome: 'Boost de odds',
    descricao: 'Aumente em até 15% o retorno de apostas múltiplas selecionadas.',
    preco: 'R$ 29,90',
  },
  {
    nome: 'Relatórios avançados',
    descricao: 'Insights personalizados com base no seu histórico para encontrar valor escondido.',
    preco: 'R$ 19,90/mês',
  },
  {
    nome: 'Alertas premium',
    descricao: 'Receba notificações push quando odds atingirem o preço-alvo definido por você.',
    preco: 'R$ 14,90/mês',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Loja - FrontBet' },
    {
      name: 'description',
      content: 'Adicione boosts e ferramentas premium para elevar sua estratégia de apostas.',
    },
  ];
}

export default function Loja() {
  return (
    <PageShell
      title="Loja FrontBet"
      description="Ferramentas opcionais para turbinar seus palpites e automatizar decisões."
    >
      <section className="grid gap-6 md:grid-cols-3">
        {produtos.map((produto) => (
          <article
            key={produto.nome}
            className="flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{produto.nome}</h2>
            <p className="mt-2 flex-1 text-[var(--color-muted)]">{produto.descricao}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold">{produto.preco}</span>
              <button className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)]">
                Adicionar
              </button>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export async function loader(args: Route.LoaderArgs) {
  await requireAuth(args);
  return {};
}
