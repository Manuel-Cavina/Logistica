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

  return (
    <TransporterOnboardingShell
      description="Tu perfil necesita correcciones antes de volver a revision. Revisa la informacion, ajusta lo necesario y vuelve a intentarlo."
      eyebrow="Correccion requerida"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Tu perfil necesita ajustes antes de volver a revision"
      tone="warning"
    >
      <TransporterVerificationSummaryCard status="REJECTED" />
      <TransporterProfileSummary profile={profile} />
      <TransporterProfileForm defaultProfile={profile} onSuccess={onSuccess} />
    </TransporterOnboardingShell>
  );
}
