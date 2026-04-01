const TRANSPORTER_VERIFIED_VIEW_SEEN_KEY_PREFIX =
  "transporter-onboarding:verified-view-seen";

function buildTransporterVerifiedViewSeenKey(userId: string): string {
  return `${TRANSPORTER_VERIFIED_VIEW_SEEN_KEY_PREFIX}:${userId}`;
}

export function hasSeenTransporterVerifiedView(userId: string): boolean {
  if (!userId || typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(
      buildTransporterVerifiedViewSeenKey(userId),
    ) === "1";
  } catch {
    return false;
  }
}

export function markTransporterVerifiedViewSeen(userId: string): void {
  if (!userId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(buildTransporterVerifiedViewSeenKey(userId), "1");
  } catch {
    // Ignore storage failures so the onboarding flow still redirects.
  }
}
