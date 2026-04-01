"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TransporterOnboardingErrorView } from "../components/transporter-onboarding-error-view";
import { TransporterOnboardingIncompleteView } from "../components/transporter-onboarding-incomplete-view";
import { TransporterOnboardingLoadingView } from "../components/transporter-onboarding-loading-view";
import { TransporterOnboardingPendingView } from "../components/transporter-onboarding-pending-view";
import { TransporterOnboardingRejectedView } from "../components/transporter-onboarding-rejected-view";
import { TransporterOnboardingVerifiedView } from "../components/transporter-onboarding-verified-view";
import { useTransporterProfile } from "../hooks/use-transporter-profile";
import { resolveTransporterOnboardingView } from "../services/transporter-onboarding-state";
import {
  hasSeenTransporterVerifiedView,
  markTransporterVerifiedViewSeen,
} from "../services/transporter-verification-once";

const VERIFIED_REDIRECT_PATH = "/dashboard";

export function TransporterOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { error, profile, refetch, requestStatus } = useTransporterProfile();
  const [hasSeenVerifiedView, setHasSeenVerifiedView] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    if (requestStatus !== "success") {
      setHasSeenVerifiedView(null);
      return;
    }

    if (profile?.verificationStatus !== "VERIFIED") {
      setHasSeenVerifiedView(false);
      return;
    }

    if (!user?.id) {
      setHasSeenVerifiedView(false);
      return;
    }

    setHasSeenVerifiedView(hasSeenTransporterVerifiedView(user.id));
  }, [profile, requestStatus, user?.id]);

  const resolvedView =
    requestStatus === "success"
      ? profile?.verificationStatus === "VERIFIED" && hasSeenVerifiedView === null
        ? "loading"
        : resolveTransporterOnboardingView(profile, {
            hasSeenVerifiedView: hasSeenVerifiedView ?? false,
          })
      : requestStatus;

  useEffect(() => {
    if (resolvedView !== "verified-redirect") {
      return;
    }

    router.replace(VERIFIED_REDIRECT_PATH);
  }, [resolvedView, router]);

  useEffect(() => {
    if (resolvedView !== "verified-once" || !user?.id) {
      return;
    }

    markTransporterVerifiedViewSeen(user.id);
  }, [resolvedView, user?.id]);

  if (resolvedView === "loading") {
    return <TransporterOnboardingLoadingView />;
  }

  if (resolvedView === "error") {
    return (
      <TransporterOnboardingErrorView
        error={error ?? "No pudimos cargar tu onboarding."}
        onRetry={refetch}
      />
    );
  }

  if (resolvedView === "verified-redirect") {
    return (
      <TransporterOnboardingLoadingView
        description="Tu perfil ya esta verificado. Te estamos redirigiendo al area principal del transportista."
        title="Perfil verificado"
      />
    );
  }

  if (resolvedView === "pending" && profile) {
    return <TransporterOnboardingPendingView profile={profile} />;
  }

  if (resolvedView === "rejected" && profile) {
    return (
      <TransporterOnboardingRejectedView onSuccess={refetch} profile={profile} />
    );
  }

  if (resolvedView === "verified-once" && profile) {
    return <TransporterOnboardingVerifiedView profile={profile} />;
  }

  return <TransporterOnboardingIncompleteView onSuccess={refetch} profile={profile} />;
}
