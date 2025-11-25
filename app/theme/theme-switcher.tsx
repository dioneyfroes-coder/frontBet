import { availableThemes, type Theme, useTheme } from "./theme-provider";

const themeLabels: Record<Theme, string> = {
  light: "Claro",
  dark: "Escuro",
  "high-contrast": "Alto contraste",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
      <span>Escolha o tema</span>
      <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-[var(--color-surface)] p-1 text-sm shadow-sm">
        {availableThemes.map((option) => {
          const isActive = option === theme;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`rounded-full px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)] shadow"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
              aria-pressed={isActive}
            >
              {themeLabels[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
