import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";

type TransporterOnboardingLoadingViewProps = {
  description?: string;
  title?: string;
};

export function TransporterOnboardingLoadingView({
  description = "Estamos consultando tu perfil para mostrar la etapa correcta del onboarding.",
  title = "Cargando tu estado de transportista",
}: TransporterOnboardingLoadingViewProps) {
  return (
    <TransporterOnboardingShell
      description={description}
      eyebrow="Estado del perfil"
      statusLabel="Validando estado"
      title={title}
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Verificando
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Sin cambiar contrato
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Cargamos tu perfil para mostrarte la vista correcta</CardTitle>
            <CardDescription>
              Mientras leemos el estado real del backend, preparamos la
              experiencia para que no veas una etapa equivocada.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded-[1.5rem] border border-border/70 bg-panel/70" />
            <div className="h-24 animate-pulse rounded-[1.5rem] border border-border/70 bg-panel/80" />
            <div className="h-24 animate-pulse rounded-[1.5rem] border border-border/70 bg-panel/70" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-[1.8rem] border border-border/70 bg-panel/80" />
            <div className="h-40 animate-pulse rounded-[1.8rem] border border-border/70 bg-panel/75" />
          </div>
        </CardContent>
      </Card>
    </TransporterOnboardingShell>
  );
}
