import type { TransporterProfile } from "../types/transporter-profile.types";

export type TransporterOnboardingView =
  | "incomplete"
  | "pending"
  | "rejected"
  | "verified-once"
  | "verified-redirect";

type ResolveTransporterOnboardingViewOptions = {
  hasSeenVerifiedView?: boolean;
};

export function resolveTransporterOnboardingView(
  profile: TransporterProfile | null,
  options: ResolveTransporterOnboardingViewOptions = {},
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
      return options.hasSeenVerifiedView ? "verified-redirect" : "verified-once";
  }
}
