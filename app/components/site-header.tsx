import { NavLink } from "react-router";
import { ThemeSwitcher } from "../theme/theme-switcher";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/jogos", label: "Jogos" },
  { to: "/loja", label: "Loja" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-bg)]/95 backdrop-blur border-b border-[color:var(--color-border)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <NavLink to="/" className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
          FrontBet
        </NavLink>
        <nav className="flex items-center gap-2 text-sm font-medium">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
