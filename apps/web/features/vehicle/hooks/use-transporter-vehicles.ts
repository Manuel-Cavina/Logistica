'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/src/lib/api';
import { fetchOwnVehicles } from '../services/list-vehicles-api';
import type { TransporterVehicle } from '../types/fleet.types';

type TransporterVehiclesRequestStatus = 'loading' | 'success' | 'error';

type TransporterVehiclesState = {
  error: string | null;
  requestStatus: TransporterVehiclesRequestStatus;
  vehicles: TransporterVehicle[];
};

const initialState: TransporterVehiclesState = {
  error: null,
  requestStatus: 'loading',
  vehicles: [],
};

function getVehiclesErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Tu sesion actual no tiene permisos para ver vehicles desde el area protegida.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos cargar los vehicles. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos cargar los vehicles. Vuelve a intentarlo.';
}

export function useTransporterVehicles() {
  const [state, setState] = useState<TransporterVehiclesState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: 'loading',
    }));

    async function loadVehicles(): Promise<void> {
      try {
        const vehicles = await fetchOwnVehicles();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          requestStatus: 'success',
          vehicles,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getVehiclesErrorMessage(error),
          requestStatus: 'error',
          vehicles: [],
        });
      }
    }

    void loadVehicles();

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
    vehicles: state.vehicles,
  };
}
