"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { fetchTransporterProfile } from "@/features/transporter-onboarding/services/transporter-profile-api";
import type { TransporterVerificationStatus } from "@/features/transporter-onboarding/types/transporter-profile.types";
import type { TransporterRouteRequestStatus } from "../services/authorization/transporter-route-access";

type UseTransporterGuardProfileOptions = {
  enabled: boolean;
};

type TransporterGuardProfileState = {
  error: string | null;
  requestStatus: TransporterRouteRequestStatus;
  verificationStatus: TransporterVerificationStatus | null;
};

type UseTransporterGuardProfileResult = {
  error: string | null;
  refetch: () => void;
  requestStatus: TransporterRouteRequestStatus;
  verificationStatus: TransporterVerificationStatus | null;
};

const disabledState: TransporterGuardProfileState = {
  error: null,
  requestStatus: "idle",
  verificationStatus: null,
};

const loadingState: TransporterGuardProfileState = {
  error: null,
  requestStatus: "loading",
  verificationStatus: null,
};

function getTransporterGuardErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos validar tu perfil de transportista. Reintenta en unos segundos.";
  }

  return "No pudimos validar tu perfil de transportista. Revisa tu conexion e intenta nuevamente.";
}

export function useTransporterGuardProfile({
  enabled,
}: UseTransporterGuardProfileOptions): UseTransporterGuardProfileResult {
  const [state, setState] = useState<TransporterGuardProfileState>(() =>
    enabled ? loadingState : disabledState,
  );
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState(disabledState);
      return;
    }

    let isCancelled = false;

    setState(loadingState);

    async function loadTransporterProfile(): Promise<void> {
      try {
        const profile = await fetchTransporterProfile();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          requestStatus: "success",
          verificationStatus: profile?.verificationStatus ?? "INCOMPLETE",
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getTransporterGuardErrorMessage(error),
          requestStatus: "error",
          verificationStatus: null,
        });
      }
    }

    void loadTransporterProfile();

    return () => {
      isCancelled = true;
    };
  }, [enabled, requestVersion]);

  return {
    error: state.error,
    refetch: () => {
      if (!enabled) {
        return;
      }

      setRequestVersion((currentVersion) => currentVersion + 1);
    },
    requestStatus: state.requestStatus,
    verificationStatus: state.verificationStatus,
  };
}
