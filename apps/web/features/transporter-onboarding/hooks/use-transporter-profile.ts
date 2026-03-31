"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { fetchTransporterProfile } from "../services/transporter-profile-api";
import {
  resolveTransporterOnboardingView,
  type TransporterOnboardingView,
} from "../services/transporter-onboarding-state";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterProfileRequestStatus = "loading" | "success" | "error";

type UseTransporterProfileResult = {
  error: string | null;
  profile: TransporterProfile | null;
  refetch: () => void;
  requestStatus: TransporterProfileRequestStatus;
  resolvedView: TransporterOnboardingView | "loading" | "error";
};

type TransporterProfileState = {
  error: string | null;
  profile: TransporterProfile | null;
  requestStatus: TransporterProfileRequestStatus;
};

const initialState: TransporterProfileState = {
  error: null,
  profile: null,
  requestStatus: "loading",
};

function getTransporterProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos cargar tu estado de onboarding. Intenta nuevamente en unos segundos.";
  }

  return "No pudimos cargar tu perfil de transportista. Vuelve a intentarlo.";
}

export function useTransporterProfile(): UseTransporterProfileResult {
  const [state, setState] = useState<TransporterProfileState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: "loading",
    }));

    async function loadTransporterProfile(): Promise<void> {
      try {
        const profile = await fetchTransporterProfile();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          profile,
          requestStatus: "success",
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getTransporterProfileErrorMessage(error),
          profile: null,
          requestStatus: "error",
        });
      }
    }

    void loadTransporterProfile();

    return () => {
      isCancelled = true;
    };
  }, [requestVersion]);

  return {
    error: state.error,
    profile: state.profile,
    refetch: () => {
      setRequestVersion((currentVersion) => currentVersion + 1);
    },
    requestStatus: state.requestStatus,
    resolvedView:
      state.requestStatus === "success"
        ? resolveTransporterOnboardingView(state.profile)
        : state.requestStatus,
  };
}
