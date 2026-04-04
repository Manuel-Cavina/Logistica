"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { fetchAdminTransporterDetail } from "../services/admin-transporter-detail-api";
import type { AdminTransporterDetail } from "../types/admin-transporter.types";

type AdminTransporterDetailRequestStatus =
  | "loading"
  | "success"
  | "error"
  | "not-found";

type UseAdminTransporterDetailResult = {
  error: string | null;
  refetch: () => void;
  requestStatus: AdminTransporterDetailRequestStatus;
  transporter: AdminTransporterDetail | null;
};

type AdminTransporterDetailState = {
  error: string | null;
  requestStatus: AdminTransporterDetailRequestStatus;
  transporter: AdminTransporterDetail | null;
};

const initialState: AdminTransporterDetailState = {
  error: null,
  requestStatus: "loading",
  transporter: null,
};

function getAdminTransporterDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return "Tu sesion actual no tiene permisos para revisar este perfil desde el area admin.";
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos cargar el detalle del transportista. Intenta nuevamente en unos segundos.";
  }

  return "No pudimos cargar el detalle del transportista. Vuelve a intentarlo.";
}

export function useAdminTransporterDetail(
  transporterId: string,
): UseAdminTransporterDetailResult {
  const [state, setState] = useState<AdminTransporterDetailState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: "loading",
    }));

    async function loadAdminTransporterDetail(): Promise<void> {
      try {
        const transporter = await fetchAdminTransporterDetail(transporterId);

        if (isCancelled) {
          return;
        }

        if (!transporter) {
          setState({
            error: null,
            requestStatus: "not-found",
            transporter: null,
          });

          return;
        }

        setState({
          error: null,
          requestStatus: "success",
          transporter,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getAdminTransporterDetailErrorMessage(error),
          requestStatus: "error",
          transporter: null,
        });
      }
    }

    void loadAdminTransporterDetail();

    return () => {
      isCancelled = true;
    };
  }, [requestVersion, transporterId]);

  return {
    error: state.error,
    refetch: () => {
      setRequestVersion((currentVersion) => currentVersion + 1);
    },
    requestStatus: state.requestStatus,
    transporter: state.transporter,
  };
}
