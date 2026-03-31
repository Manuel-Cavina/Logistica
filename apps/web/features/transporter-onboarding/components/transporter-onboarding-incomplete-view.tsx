import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileFormPlaceholder } from "./transporter-profile-form-placeholder";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingIncompleteViewProps = {
  profile: TransporterProfile | null;
};

const minimumRequirements = [
  "Nombre visible del transportista",
  "Telefono de contacto operativo",
  "Datos consistentes para pasar de INCOMPLETE a PENDING desde backend",
];

export function TransporterOnboardingIncompleteView({
  profile,
}: TransporterOnboardingIncompleteViewProps) {
  return (
    <TransporterOnboardingShell
      description="Esta etapa prepara la informacion minima del perfil para que la verificacion manual pueda arrancar sin friccion."
      eyebrow="Perfil inicial"
      statusLabel="Estado: incompleto"
      title="Completa tu onboarding para empezar a operar como transportista"
    >
      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Tu perfil todavia necesita informacion base</CardTitle>
          <CardDescription>
            El backend decide el cambio a revision cuando el perfil queda completo.
            Esta pantalla solo organiza la experiencia y deja listo el lugar del formulario.
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

          <a
            className="inline-flex h-14 items-center justify-center rounded-[1.4rem] bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(27,67,50,0.18)] transition hover:bg-[#143428]"
            href="#profile-form-placeholder"
          >
            Ver espacio del formulario
          </a>
        </CardContent>
      </Card>

      {profile ? <TransporterProfileSummary profile={profile} /> : null}
      <TransporterProfileFormPlaceholder />
    </TransporterOnboardingShell>
  );
}
