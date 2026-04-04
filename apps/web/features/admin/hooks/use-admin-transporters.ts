"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api";
import { fetchAdminTransporters } from "../services/admin-transporters-api";
import type { AdminTransporterListItem } from "../types/admin-transporter.types";

type AdminTransportersRequestStatus = "loading" | "success" | "error";

type UseAdminTransportersResult = {
  error: string | null;
  refetch: () => void;
  requestStatus: AdminTransportersRequestStatus;
  transporters: AdminTransporterListItem[];
};

type AdminTransportersState = {
  error: string | null;
  requestStatus: AdminTransportersRequestStatus;
  transporters: AdminTransporterListItem[];
};

const initialState: AdminTransportersState = {
  error: null,
  requestStatus: "loading",
  transporters: [],
};

function getAdminTransportersErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return "Tu sesion actual no tiene permisos para revisar transportistas desde el area admin.";
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos cargar el listado de transportistas. Intenta nuevamente en unos segundos.";
  }

  return "No pudimos cargar el listado de transportistas. Vuelve a intentarlo.";
}

export function useAdminTransporters(): UseAdminTransportersResult {
  const [state, setState] = useState<AdminTransportersState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: "loading",
    }));

    async function loadAdminTransporters(): Promise<void> {
      try {
        const transporters = await fetchAdminTransporters();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          requestStatus: "success",
          transporters,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getAdminTransportersErrorMessage(error),
          requestStatus: "error",
          transporters: [],
        });
      }
    }

    void loadAdminTransporters();

    return () => {
      isCancelled = true;
    };
  }, [requestVersion]);

  return {
    error: state.error,
    refetch: () => {
      setRequestVersion((currentVersion) => currentVersion + 1);
    },
    requestStatus: state.requestStatus,
    transporters: state.transporters,
  };
}
