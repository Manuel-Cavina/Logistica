'use client';

import { ApiError, NotFoundError } from '@/src/lib/api';
import { useFormSubmit } from '@/src/lib/forms/hooks/useFormSubmit';
import { deactivateTrailer } from '../services/deactivate-trailer-api';
import type { Trailer } from '../types/trailer.types';

function getDeactivateTrailerErrorMessage(error: unknown): string {
  if (error instanceof NotFoundError) {
    return 'No encontramos el trailer que intentas desactivar.';
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return 'Tu sesion no tiene acceso para desactivar trailers. Vuelve a ingresar e intenta otra vez.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos desactivar el trailer por un problema del servidor. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos desactivar el trailer. Vuelve a intentarlo.';
}

type UseDeactivateTrailerOptions = {
  onSuccess?: (trailer: Trailer) => void;
};

export function useDeactivateTrailer({
  onSuccess,
}: UseDeactivateTrailerOptions = {}) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (trailerId: string) => {
      const trailer = await deactivateTrailer(trailerId);

      onSuccess?.(trailer);

      return trailer;
    },
    {
      getErrorMessage: getDeactivateTrailerErrorMessage,
    },
  );

  return {
    deactivateTrailer: submit,
    isSubmitting,
    resetSubmitError,
    submitError,
  };
}
