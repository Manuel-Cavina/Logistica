import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileFormPlaceholder } from "./transporter-profile-form-placeholder";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingRejectedViewProps = {
  profile: TransporterProfile;
};

export function TransporterOnboardingRejectedView({
  profile,
}: TransporterOnboardingRejectedViewProps) {
  return (
    <TransporterOnboardingShell
      description="El perfil fue rechazado por backend, pero la UI no inventa razones ni reescribe ese criterio. Solo habilita una experiencia clara para revisar y corregir."
      eyebrow="Correccion requerida"
      statusLabel="Estado: rechazado"
      title="Tu perfil necesita ajustes antes de volver a revision"
      tone="warning"
    >
      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Revisa y actualiza tu informacion</CardTitle>
          <CardDescription>
            No mostramos un motivo especifico porque este endpoint no lo devuelve. La
            siguiente iteracion del formulario se conectara sobre esta misma estructura.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-[1.4rem] border border-[#e9cbb8] bg-[#fff4ed] px-4 py-4 text-sm leading-6 text-[#6f3b1f]">
            Puedes volver a editar el perfil y reenviar los datos cuando la captura del
            formulario este habilitada.
          </div>

          <a
            className="inline-flex h-14 items-center justify-center rounded-[1.4rem] bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(27,67,50,0.18)] transition hover:bg-[#143428]"
            href="#profile-form-placeholder"
          >
            Revisar datos del perfil
          </a>
        </CardContent>
      </Card>

      <TransporterProfileSummary profile={profile} />
      <TransporterProfileFormPlaceholder />
    </TransporterOnboardingShell>
  );
}
