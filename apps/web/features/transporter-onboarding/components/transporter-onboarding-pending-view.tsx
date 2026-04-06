import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransporterVerificationStatusConfig } from "../config/transporter-verification-status.config";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingPendingViewProps = {
  profile: TransporterProfile;
};

export function TransporterOnboardingPendingView({
  profile,
}: TransporterOnboardingPendingViewProps) {
  const statusConfig = getTransporterVerificationStatusConfig("PENDING");

  const reviewSignals = [
    "Revisamos la informacion cargada en el perfil.",
    "No hace falta reenviar los datos mientras esta en proceso.",
    "La siguiente pantalla se muestra apenas el estado cambia.",
  ];

  return (
    <TransporterOnboardingShell
      description="Ya recibimos tu informacion y la estamos revisando. Mientras tanto no hace falta volver a enviarla."
      eyebrow="Revision manual"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Estamos revisando tu perfil de transportista"
      tone="warning"
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#ead1be] bg-[#fff5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a4a2b]">
              En curso
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Estado estable
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Tu perfil ya entro en revision manual</CardTitle>
            <CardDescription>
              La vista prioriza el estado actual para que sepas que esta pasando
              y que no hace falta repetir.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {reviewSignals.map((signal, index) => (
              <article
                key={signal}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  0{index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">{signal}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <TransporterVerificationSummaryCard
        className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]"
        status="PENDING"
      />
      <TransporterProfileSummary profile={profile} />
    </TransporterOnboardingShell>
  );
}
