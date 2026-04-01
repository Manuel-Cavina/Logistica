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
      description="Tu informacion ya fue enviada y esta en revision. Evitamos mostrar acciones de onboarding que induzcan a editar o reenviar algo fuera de este estado."
      eyebrow="Revision manual"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Estamos verificando tu perfil de transportista"
      tone="success"
    >
      <TransporterVerificationSummaryCard status="PENDING" />
      <TransporterProfileSummary profile={profile} />
    </TransporterOnboardingShell>
  );
}
