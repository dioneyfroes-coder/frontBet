import type { Route } from "./+types/login";
import { PageShell } from "../components/page-shell";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - FrontBet" },
    {
      name: "description",
      content: "Entre na sua conta FrontBet e acompanhe palpites, limites e histórico em tempo real.",
    },
  ];
}

export default function Login() {
  return (
    <PageShell title="Entrar na FrontBet" description="Use suas credenciais para continuar apostando com segurança.">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <form className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm text-[var(--color-muted)]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-[var(--color-muted)]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-bg)]"
          >
            Continuar
          </button>
          <p className="text-center text-sm text-[var(--color-muted)]">
            Esqueceu a senha? <span className="text-[var(--color-primary)]">Recuperar acesso</span>
          </p>
        </form>
      </div>
    </PageShell>
  );
}
