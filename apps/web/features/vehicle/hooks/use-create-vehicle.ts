"use client";

import { ApiError, BadRequestError, ConflictError } from "@/src/lib/api";
import { useFormSubmit } from "@/src/lib/forms/hooks/useFormSubmit";
import { createVehicle } from "../services/create-vehicle-api";
import type { Vehicle, VehicleFormValues } from "../types/vehicle.types";

function getCreateVehicleErrorMessage(error: unknown): string {
  if (error instanceof ConflictError) {
    return "Ya existe un vehicle con esa patente. Revisa el dato e intenta de nuevo.";
  }

  if (error instanceof BadRequestError) {
    return "Los datos del vehicle no son validos. Revisa los campos e intenta otra vez.";
  }

  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "Tu sesion no tiene acceso para registrar vehicles. Vuelve a ingresar e intenta otra vez.";
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos registrar el vehicle por un problema del servidor. Intenta nuevamente en unos segundos.";
  }

  return "No pudimos registrar el vehicle. Vuelve a intentarlo.";
}

type UseCreateVehicleOptions = {
  onSuccess?: (vehicle: Vehicle) => void;
};

export function useCreateVehicle({
  onSuccess,
}: UseCreateVehicleOptions = {}) {
  const { isSubmitting, resetSubmitError, submit, submitError } = useFormSubmit(
    async (values: VehicleFormValues) => {
      const vehicle = await createVehicle(values);

      onSuccess?.(vehicle);

      return vehicle;
    },
    {
      getErrorMessage: getCreateVehicleErrorMessage,
    },
  );

  return {
    createVehicle: submit,
    isSubmitting,
    resetSubmitError,
    submitError,
  };
}
