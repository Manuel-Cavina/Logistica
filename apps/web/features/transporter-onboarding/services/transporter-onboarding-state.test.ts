import { resolveTransporterOnboardingView } from "./transporter-onboarding-state";
import type { TransporterProfile } from "../types/transporter-profile.types";

function buildProfile(
  verificationStatus: TransporterProfile["verificationStatus"],
): TransporterProfile {
  return {
    bio: null,
    businessName: null,
    contactPhone: "1155550000",
    displayName: "Transporte Norte",
    maxDetourKmDefault: 120,
    verificationStatus,
  };
}

describe("resolveTransporterOnboardingView", () => {
  it("maps null profiles to the initial onboarding view", () => {
    expect(resolveTransporterOnboardingView(null)).toBe("incomplete");
  });

  it.each([
    ["INCOMPLETE", "incomplete"],
    ["PENDING", "pending"],
    ["REJECTED", "rejected"],
    ["VERIFIED", "verified-once"],
  ] as const)(
    "maps %s correctly",
    (verificationStatus, expectedView) => {
      expect(
        resolveTransporterOnboardingView(buildProfile(verificationStatus)),
      ).toBe(expectedView);
    },
  );

  it("redirects verified transporters immediately after the confirmation was already shown", () => {
    expect(
      resolveTransporterOnboardingView(buildProfile("VERIFIED"), {
        hasSeenVerifiedView: true,
      }),
    ).toBe("verified-redirect");
  });
});
