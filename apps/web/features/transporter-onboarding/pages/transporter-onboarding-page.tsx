"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TransporterOnboardingErrorView } from "../components/transporter-onboarding-error-view";
import { TransporterOnboardingIncompleteView } from "../components/transporter-onboarding-incomplete-view";
import { TransporterOnboardingLoadingView } from "../components/transporter-onboarding-loading-view";
import { TransporterOnboardingPendingView } from "../components/transporter-onboarding-pending-view";
import { TransporterOnboardingRejectedView } from "../components/transporter-onboarding-rejected-view";
import { useTransporterProfile } from "../hooks/use-transporter-profile";

const VERIFIED_REDIRECT_PATH = "/dashboard";

export function TransporterOnboardingPage() {
  const router = useRouter();
  const { error, profile, refetch, resolvedView } = useTransporterProfile();

  useEffect(() => {
    if (resolvedView !== "verified-redirect") {
      return;
    }

    router.replace(VERIFIED_REDIRECT_PATH);
  }, [resolvedView, router]);

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
    return <TransporterOnboardingRejectedView profile={profile} />;
  }

  return <TransporterOnboardingIncompleteView profile={profile} />;
}
