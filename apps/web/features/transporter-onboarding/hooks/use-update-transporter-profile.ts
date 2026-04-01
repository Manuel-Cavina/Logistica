"use client";

import { ApiError, BadRequestError } from "@/src/lib/api";
import { useFormSubmit } from "@/src/lib/forms/hooks/useFormSubmit";
import type { UpdateTransporterProfileDto } from "@logistica/shared";
import { updateTransporterProfile } from "../services/update-transporter-profile-api";

type UseUpdateTransporterProfileOptions = {
  onSuccess?: () => void;
};

function getUpdateErrorMessage(error: unknown): string {
  if (error instanceof BadRequestError) {
    return "Los datos ingresados no son validos. Revisa los campos e intenta de nuevo.";
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos guardar tu perfil. Intenta de nuevo en unos segundos.";
  }

  return "No pudimos guardar tu perfil. Vuelve a intentarlo.";
}

export function useUpdateTransporterProfile({
  onSuccess,
}: UseUpdateTransporterProfileOptions) {
  const { isSubmitting, submit, submitError } = useFormSubmit(
    async (dto: UpdateTransporterProfileDto) => {
      await updateTransporterProfile(dto);
      onSuccess?.();
    },
    {
      getErrorMessage: getUpdateErrorMessage,
    },
  );

  return {
    isSubmitting,
    submitError,
    updateProfile: submit,
  };
}
