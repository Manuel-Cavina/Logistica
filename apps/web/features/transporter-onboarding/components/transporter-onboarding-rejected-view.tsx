import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransporterVerificationStatusConfig } from "../config/transporter-verification-status.config";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileForm } from "./transporter-profile-form";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingRejectedViewProps = {
  onSuccess: () => void;
  profile: TransporterProfile;
};

export function TransporterOnboardingRejectedView({
  onSuccess,
  profile,
}: TransporterOnboardingRejectedViewProps) {
  const statusConfig = getTransporterVerificationStatusConfig("REJECTED");

  const correctionNotes = [
    "Revisar los datos que quedaron incompletos o inconsistentes.",
    "Actualizar la informacion base antes de volver a enviar.",
    "Confirmar que el resumen del perfil ya quede listo para revision.",
  ];

  return (
    <TransporterOnboardingShell
      description="Tu perfil necesita correcciones antes de volver a revision. Revisa la informacion, ajusta lo necesario y vuelve a intentarlo."
      eyebrow="Correccion requerida"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Hay correcciones puntuales antes de volver a revision"
      tone="warning"
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#e7b9a2] bg-[#fff2ea] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7d3b1a]">
              Requiere ajustes
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Sin perder el historial del perfil
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Corregi lo necesario y vuelve a enviar</CardTitle>
            <CardDescription>
              La pantalla destaca la accion siguiente para que el retorno a
              revision sea lo mas directo posible.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {correctionNotes.map((note, index) => (
              <article
                key={note}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  0{index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">{note}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <TransporterVerificationSummaryCard
        className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]"
        status="REJECTED"
      />
      <TransporterProfileSummary profile={profile} />
      <TransporterProfileForm defaultProfile={profile} onSuccess={onSuccess} />
    </TransporterOnboardingShell>
  );
}
