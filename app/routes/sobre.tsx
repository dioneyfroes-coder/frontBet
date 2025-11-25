import type { Route } from "./+types/sobre";
import { PageShell } from "../components/page-shell";

const pilares = [
  {
    title: "Tecnologia em tempo real",
    description: "Infraestrutura otimizada para atualizar probabilidades em milissegundos, garantindo decisões ágeis.",
  },
  {
    title: "Responsabilidade",
    description: "Ferramentas de limites, alertas e educação financeira para promover apostas conscientes.",
  },
  {
    title: "Experiência local",
    description: "Conteúdo e suporte em português, com foco no calendário esportivo brasileiro e sul-americano.",
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sobre - FrontBet" },
    {
      name: "description",
      content: "Conheça a missão da FrontBet e como ajudamos apostadores a jogarem com inteligência.",
    },
  ];
}

export default function Sobre() {
  return (
    <PageShell
      title="Quem somos"
      description="A FrontBet nasce para oferecer uma experiência de apostas transparente, rápida e desenhada para a nova geração de apostadores digitais."
    >
      <section className="grid gap-6 md:grid-cols-3">
        {pilares.map((pilar) => (
          <article
            key={pilar.title}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{pilar.title}</h2>
            <p className="mt-2 text-[var(--color-muted)]">{pilar.description}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
