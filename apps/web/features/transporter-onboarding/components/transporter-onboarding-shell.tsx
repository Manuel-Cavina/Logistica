import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

const onboardingSignals = [
  {
    label: "Estado sincronizado",
    value: "API E2 actual",
  },
  {
    label: "Etapa actual",
    value: "Onboarding transportista",
  },
  {
    label: "Experiencia",
    value: "UX redisenada",
  },
];

const onboardingHighlights = [
  {
    title: "Lectura rapida",
    description:
      "La pantalla pone el estado primero para que el transportista entienda en segundos donde esta parado.",
  },
  {
    title: "Accion obvia",
    description:
      "Cada vista deja una proxima accion clara sin esconder el contrato actual ni la logica existente.",
  },
  {
    title: "Base operativa",
    description:
      "El rediseno conserva el flujo real y solo mejora jerarquia, contraste y sensacion de progreso.",
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
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5efe3_0%,#efe3cd_48%,#e6d6b9_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-[-8rem] top-[-8rem] size-[24rem] rounded-full bg-[#dbe9d6]/50 blur-3xl" />
        <div className="absolute right-[-6rem] top-[12rem] size-[18rem] rounded-full bg-[#f1d8b7]/55 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[26%] size-[22rem] rounded-full bg-[#bfd8d0]/35 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative overflow-hidden rounded-[2.4rem] border border-white/30 bg-[linear-gradient(160deg,#1a4d3b_0%,#12312a_48%,#0d1d19_100%)] text-primary-foreground shadow-[0_28px_60px_rgba(27,67,50,0.18)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 18%, rgba(108,196,255,0.18), transparent 24%), radial-gradient(circle at 82% 20%, rgba(255,204,92,0.14), transparent 18%), linear-gradient(180deg, rgba(24,68,53,0.12), rgba(20,52,40,0.52))",
            }}
          />

          <div className="relative flex h-full flex-col gap-8 p-6 sm:p-8">
            <div className="inline-flex w-fit items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
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

            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/90">
                  E2 redesign
                </span>
                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                    toneClasses[tone],
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/66">
                {eyebrow}
              </p>
              <h1 className="max-w-xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-primary-foreground/78">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {onboardingSignals.map((signal) => (
                <article
                  key={signal.label}
                  className="rounded-[1.4rem] border border-white/10 bg-[rgba(10,26,22,0.56)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                    {signal.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                    {signal.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid gap-3">
              {onboardingHighlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.54)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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
        </aside>

        <section className="space-y-5">
          <Card className="border-white/70 bg-white/80 shadow-[0_16px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardContent className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Vista del flujo
                </p>
                <p className="text-sm leading-6 text-foreground/80">
                  La API del onboarding se mantiene intacta. Este rediseno solo
                  cambia jerarquia visual, claridad de estado y feedback.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                Contrato E2 intacto
              </div>
            </CardContent>
          </Card>

          {children}
        </section>
      </div>
    </main>
  );
}
