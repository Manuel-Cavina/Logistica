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
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-[2rem] border border-border/70 bg-panel/85" />
        <div className="h-64 animate-pulse rounded-[2rem] border border-border/70 bg-panel/75" />
      </div>
    </TransporterOnboardingShell>
  );
}
