import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingPendingViewProps = {
  profile: TransporterProfile;
};

export function TransporterOnboardingPendingView({
  profile,
}: TransporterOnboardingPendingViewProps) {
  return (
    <TransporterOnboardingShell
      description="Tu informacion ya fue enviada y esta en revision. Evitamos mostrar acciones de onboarding que induzcan a editar o reenviar algo fuera de este estado."
      eyebrow="Revision manual"
      statusLabel="Estado: en revision"
      title="Estamos verificando tu perfil de transportista"
      tone="success"
    >
      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Perfil recibido correctamente</CardTitle>
          <CardDescription>
            Nuestro equipo esta validando la informacion. Cuando el backend marque tu
            perfil como verificado, el onboarding dejara de mostrarse.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-[1.4rem] border border-[#cfe3d5] bg-[#eef8f0] px-4 py-4 text-sm leading-6 text-[#1f5136]">
            No necesitas volver a cargar la informacion en este momento.
          </div>
        </CardContent>
      </Card>

      <TransporterProfileSummary profile={profile} />
    </TransporterOnboardingShell>
  );
}
