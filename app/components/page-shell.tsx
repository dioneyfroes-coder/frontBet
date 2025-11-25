import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({ children, title, description }: {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <SiteHeader />
      <main id="main" className="flex-1 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
          {description && (
            <p className="max-w-3xl text-lg text-[var(--color-muted)]">{description}</p>
          )}
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
