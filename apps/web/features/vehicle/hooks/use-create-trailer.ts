'use client';

import { ApiError, BadRequestError } from '@/src/lib/api';
import { useFormSubmit } from '@/src/lib/forms/hooks/useFormSubmit';
import { createTrailer } from '../services/create-trailer-api';
import type { Trailer, TrailerFormValues } from '../types/trailer.types';

function getCreateTrailerErrorMessage(error: unknown): string {
  if (error instanceof BadRequestError) {
    return 'Los datos del trailer no son validos. Revisa los campos e intenta otra vez.';
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return 'Tu sesion no tiene acceso para registrar trailers. Vuelve a ingresar e intenta otra vez.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos registrar el trailer por un problema del servidor. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos registrar el trailer. Vuelve a intentarlo.';
}

type UseCreateTrailerOptions = {
  onSuccess?: (trailer: Trailer) => void;
};

export function useCreateTrailer({ onSuccess }: UseCreateTrailerOptions = {}) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (values: TrailerFormValues) => {
      const trailer = await createTrailer(values);

      onSuccess?.(trailer);

      return trailer;
    },
    {
      getErrorMessage: getCreateTrailerErrorMessage,
    },
  );

  return {
    createTrailer: submit,
    isSubmitting,
    resetSubmitError,
    submitError,
  };
}
