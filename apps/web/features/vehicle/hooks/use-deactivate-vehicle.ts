'use client';

import { ApiError, NotFoundError } from '@/src/lib/api';
import { useFormSubmit } from '@/src/lib/forms/hooks/useFormSubmit';
import { deactivateVehicle } from '../services/deactivate-vehicle-api';
import type { Vehicle } from '../types/vehicle.types';

function getDeactivateVehicleErrorMessage(error: unknown): string {
  if (error instanceof NotFoundError) {
    return 'No encontramos el vehicle que intentas desactivar.';
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return 'Tu sesion no tiene acceso para desactivar vehicles. Vuelve a ingresar e intenta otra vez.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos desactivar el vehicle por un problema del servidor. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos desactivar el vehicle. Vuelve a intentarlo.';
}

type UseDeactivateVehicleOptions = {
  onSuccess?: (vehicle: Vehicle) => void;
};

export function useDeactivateVehicle({
  onSuccess,
}: UseDeactivateVehicleOptions = {}) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (vehicleId: string) => {
      const vehicle = await deactivateVehicle(vehicleId);

      onSuccess?.(vehicle);

      return vehicle;
    },
    {
      getErrorMessage: getDeactivateVehicleErrorMessage,
    },
  );

  return {
    deactivateVehicle: submit,
    isSubmitting,
    resetSubmitError,
    submitError,
  };
}
