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

  return (
    <TransporterOnboardingShell
      description="Ya recibimos tu informacion y la estamos revisando. Mientras tanto no hace falta volver a enviarla."
      eyebrow="Revision manual"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Estamos verificando tu perfil de transportista"
      tone="warning"
    >
      <TransporterVerificationSummaryCard status="PENDING" />
      <TransporterProfileSummary profile={profile} />
    </TransporterOnboardingShell>
  );
}
