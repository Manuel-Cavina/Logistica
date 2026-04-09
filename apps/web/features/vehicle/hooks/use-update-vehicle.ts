'use client';

import { ApiError, BadRequestError, ConflictError } from '@/src/lib/api';
import { useFormSubmit } from '@/src/lib/forms/hooks/useFormSubmit';
import { updateVehicle } from '../services/update-vehicle-api';
import type { Vehicle, VehicleUpdateFormValues } from '../types/vehicle.types';

function getUpdateVehicleErrorMessage(error: unknown): string {
  if (error instanceof ConflictError) {
    return 'Ya existe un vehicle con esa patente. Revisa el dato e intenta de nuevo.';
  }

  if (error instanceof BadRequestError) {
    return 'Los datos del vehicle no son validos. Revisa los campos e intenta otra vez.';
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return 'Tu sesion no tiene acceso para editar vehicles. Vuelve a ingresar e intenta otra vez.';
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'No pudimos guardar el vehicle por un problema del servidor. Intenta nuevamente en unos segundos.';
  }

  return 'No pudimos guardar el vehicle. Vuelve a intentarlo.';
}

type UseUpdateVehicleOptions = {
  onSuccess?: (vehicle: Vehicle) => void;
};

export function useUpdateVehicle(
  vehicleId: string,
  { onSuccess }: UseUpdateVehicleOptions = {},
) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (values: VehicleUpdateFormValues) => {
      const vehicle = await updateVehicle(vehicleId, values);

      onSuccess?.(vehicle);

      return vehicle;
    },
    {
      getErrorMessage: getUpdateVehicleErrorMessage,
    },
  );

  return {
    isSubmitting,
    resetSubmitError,
    submitError,
    updateVehicle: submit,
  };
}
