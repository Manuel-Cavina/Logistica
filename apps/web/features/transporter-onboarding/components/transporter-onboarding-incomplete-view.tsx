import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransporterVerificationStatusConfig } from "../config/transporter-verification-status.config";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileForm } from "./transporter-profile-form";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingIncompleteViewProps = {
  onSuccess: () => void;
  profile: TransporterProfile | null;
};

const minimumRequirements = [
  "Nombre visible del transportista",
  "Telefono de contacto operativo",
  "Informacion base lista para enviar tu perfil a revision",
];

const activationSteps = [
  {
    label: "1",
    title: "Completa los datos base",
    description: "Asegurate de dejar visible el nombre, telefono y biografia minima.",
  },
  {
    label: "2",
    title: "Guarda y revisa el resumen",
    description: "La pantalla te muestra el perfil actual para confirmar que todo quedo bien.",
  },
  {
    label: "3",
    title: "Envia a revision",
    description: "Cuando el backend detecte los datos minimos, la vista avanza sola al siguiente estado.",
  },
];

export function TransporterOnboardingIncompleteView({
  onSuccess,
  profile,
}: TransporterOnboardingIncompleteViewProps) {
  const statusConfig = getTransporterVerificationStatusConfig("INCOMPLETE");

  return (
    <TransporterOnboardingShell
      description="Esta etapa prepara la informacion minima del perfil para que la verificacion manual pueda arrancar sin friccion."
      eyebrow="Perfil inicial"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Terminemos tu perfil para dejarlo listo para revision"
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Ruta de activacion
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Sin cambiar contrato
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Tenes tres pasos claros antes de enviar el perfil</CardTitle>
            <CardDescription>
              La experiencia destaca lo minimo necesario para que sepas que falta
              y como seguir sin dar vueltas.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {activationSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.45)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Paso {step.label}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <TransporterVerificationSummaryCard
        className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]"
        status="INCOMPLETE"
      />

      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader>
          <CardTitle>Tu perfil todavia necesita informacion base</CardTitle>
          <CardDescription>
            Completa estos datos para dejar tu perfil listo para revision y evitar
            demoras en la validacion.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3">
            {minimumRequirements.map((requirement) => (
              <div
                key={requirement}
                className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4 text-sm leading-6 text-foreground"
              >
                {requirement}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {profile ? <TransporterProfileSummary profile={profile} /> : null}
      <TransporterProfileForm defaultProfile={profile} onSuccess={onSuccess} />
    </TransporterOnboardingShell>
  );
}
