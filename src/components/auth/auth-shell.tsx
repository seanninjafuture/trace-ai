import type { ReactNode } from "react";

const FEATURES = [
  "Real-time collaborative architecture canvas",
  "AI chaos simulation from plain-English prompts",
  "Automated incident playbook export",
] as const;

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen font-sans sm:grid-cols-2">
      <aside
        className="relative hidden flex-col items-center justify-center border-r border-border-default bg-auth-panel px-10 py-12 sm:flex sm:px-14"
        aria-label="Trace AI"
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[color-mix(in_srgb,var(--accent-primary)_45%,var(--border-default))]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/2 size-64 -translate-y-1/2 rounded-full bg-(--auth-panel-glow) blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-lg border border-border-default bg-bg-base">
            <span className="font-mono text-base font-semibold text-accent-primary">
              T
            </span>
          </div>
          <p className="mt-8 font-sans text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Trace AI
          </p>
          <p className="mt-4 max-w-sm font-sans text-base leading-relaxed text-text-muted sm:text-lg">
            Collaborative system simulation and stress-testing workspace.
          </p>
          <ul className="mt-10 w-full space-y-5 sm:max-w-sm">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-left font-sans text-base leading-relaxed text-text-muted sm:text-lg"
              >
                <span
                  className="mt-2 size-2 shrink-0 rounded-full bg-accent-primary"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-10 sm:min-h-0 sm:px-10 sm:py-12">
        <div className="w-full max-w-md font-sans">
          {children}
        </div>
      </main>
    </div>
  );
}
