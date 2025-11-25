export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-[var(--color-text)]">FrontBet</p>
        <p>
          © {new Date().getFullYear()} FrontBet. Todas as probabilidades exibidas são
          ilustrativas.
        </p>
        <div className="flex gap-4">
          <a href="/sobre" className="hover:text-[var(--color-text)]">
            Sobre
          </a>
          <a href="/contato" className="hover:text-[var(--color-text)]">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
