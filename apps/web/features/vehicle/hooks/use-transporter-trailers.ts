'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/src/lib/api';
import { fetchOwnTrailers } from '../services/list-trailers-api';
import type { TransporterTrailer } from '../types/fleet.types';

export type TransporterTrailersRequestStatus = 'loading' | 'success' | 'error';

type TransporterTrailersState = {
  error: string | null;
  requestStatus: TransporterTrailersRequestStatus;
  trailers: TransporterTrailer[];
};

const initialState: TransporterTrailersState = {
  error: null,
  requestStatus: 'loading',
  trailers: [],
};

function getTrailersErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Tu sesion actual no tiene permisos para ver trailers desde el area protegida.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos cargar los trailers. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos cargar los trailers. Vuelve a intentarlo.';
}

export function useTransporterTrailers() {
  const [state, setState] = useState<TransporterTrailersState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: 'loading',
    }));

    async function loadTrailers(): Promise<void> {
      try {
        const trailers = await fetchOwnTrailers();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          requestStatus: 'success',
          trailers,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          error: getTrailersErrorMessage(error),
          requestStatus: 'error',
          trailers: [],
        });
      }
    }

    void loadTrailers();

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
    trailers: state.trailers,
  };
}
