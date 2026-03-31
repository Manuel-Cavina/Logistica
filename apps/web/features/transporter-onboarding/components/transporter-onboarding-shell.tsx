import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type ShellTone = "default" | "warning" | "success";

type TransporterOnboardingShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  statusLabel: string;
  title: string;
  tone?: ShellTone;
};

const toneClasses: Record<ShellTone, string> = {
  default: "bg-white/10 text-primary-foreground/92",
  warning: "bg-[#f5d7c2] text-[#5f3117]",
  success: "bg-[#d4ead8] text-[#1b4332]",
};

const onboardingHighlights = [
  {
    title: "Publica capacidad real",
    description:
      "Deja listo tu perfil para empezar a ofrecer cupos y retornos sin friccion operativa.",
  },
  {
    title: "Recibe reservas con contexto",
    description:
      "El onboarding ordena la base del perfil para que la operacion posterior tenga menos dudas.",
  },
  {
    title: "Trabaja con trazabilidad",
    description:
      "La plataforma necesita un perfil claro para sostener confianza y estados visibles en el flujo.",
  },
];

export function TransporterOnboardingShell({
  children,
  description,
  eyebrow,
  statusLabel,
  title,
  tone = "default",
}: TransporterOnboardingShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="overflow-hidden rounded-[2.4rem] bg-primary text-primary-foreground shadow-[0_28px_60px_rgba(27,67,50,0.18)]">
          <div className="relative h-full overflow-hidden p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 18%, rgba(108,196,255,0.2), transparent 24%), radial-gradient(circle at 84% 20%, rgba(255,204,92,0.18), transparent 20%), linear-gradient(180deg, rgba(30,92,128,0.18), rgba(42,130,114,0.24), rgba(20,52,40,0.42))",
              }}
            />

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="inline-flex w-fit items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-white/15 text-sm font-semibold tracking-[0.18em]">
                  ET
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/62">
                    Equine Terra
                  </p>
                  <p className="text-sm font-medium text-primary-foreground/90">
                    Onboarding del transportista
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/66">
                  {eyebrow}
                </p>
                <h1 className="mt-4 max-w-xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-[2.8rem]">
                  {title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-primary-foreground/78">
                  {description}
                </p>
                <div
                  className={cn(
                    "mt-6 inline-flex rounded-full px-4 py-2 text-sm font-semibold",
                    toneClasses[tone],
                  )}
                >
                  {statusLabel}
                </div>
              </div>

              <div className="grid gap-3">
                {onboardingHighlights.map((highlight) => (
                  <article
                    key={highlight.title}
                    className="rounded-[1.6rem] border border-white/10 bg-[rgba(20,52,40,0.92)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <h2 className="text-sm font-semibold text-primary-foreground">
                      {highlight.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-primary-foreground/72">
                      {highlight.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">{children}</section>
      </div>
    </main>
  );
}
