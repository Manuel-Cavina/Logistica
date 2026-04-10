'use client';

import { ApiError, BadRequestError } from '@/src/lib/api';
import { useFormSubmit } from '@/src/lib/forms/hooks/useFormSubmit';
import { updateTrailer } from '../services/update-trailer-api';
import type { Trailer, TrailerUpdateFormValues } from '../types/trailer.types';

function getUpdateTrailerErrorMessage(error: unknown): string {
  if (error instanceof BadRequestError) {
    return 'Los datos del trailer no son validos. Revisa los campos e intenta otra vez.';
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return 'Tu sesion no tiene acceso para editar trailers. Vuelve a ingresar e intenta otra vez.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos guardar el trailer por un problema del servidor. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos guardar el trailer. Vuelve a intentarlo.';
}

type UseUpdateTrailerOptions = {
  onSuccess?: (trailer: Trailer) => void;
};

export function useUpdateTrailer(
  trailerId: string,
  { onSuccess }: UseUpdateTrailerOptions = {},
) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (values: TrailerUpdateFormValues) => {
      const trailer = await updateTrailer(trailerId, values);

      onSuccess?.(trailer);

      return trailer;
    },
    {
      getErrorMessage: getUpdateTrailerErrorMessage,
    },
  );

  return {
    isSubmitting,
    resetSubmitError,
    submitError,
    updateTrailer: submit,
  };
}
