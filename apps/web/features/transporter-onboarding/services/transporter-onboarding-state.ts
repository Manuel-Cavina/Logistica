import type { TransporterProfile } from "../types/transporter-profile.types";

export type TransporterOnboardingView =
  | "incomplete"
  | "pending"
  | "rejected"
  | "verified-redirect";

export function resolveTransporterOnboardingView(
  profile: TransporterProfile | null,
): TransporterOnboardingView {
  if (!profile) {
    return "incomplete";
  }

  switch (profile.verificationStatus) {
    case "INCOMPLETE":
      return "incomplete";
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    case "VERIFIED":
      return "verified-redirect";
  }
}
