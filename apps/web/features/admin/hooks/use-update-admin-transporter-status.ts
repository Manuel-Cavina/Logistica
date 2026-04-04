"use client";

import { useState } from "react";
import { ApiError } from "@/src/lib/api";
import { updateAdminTransporterStatus } from "../services/update-admin-transporter-status-api";
import type {
  AdminTransporterDetail,
  AdminTransporterVerificationDecision,
} from "../types/admin-transporter.types";

type UpdateAdminTransporterStatusResult = {
  error: string | null;
  isSubmitting: boolean;
  lastSubmittedStatus: AdminTransporterVerificationDecision | null;
  resetFeedback: () => void;
  submitStatus: (
    verificationStatus: AdminTransporterVerificationDecision,
  ) => Promise<AdminTransporterDetail | null>;
  successMessage: string | null;
};

function getUpdateAdminTransporterStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "El estado del perfil cambio o la transicion ya no es valida. Recarga el detalle y vuelve a revisar.";
  }

  if (error instanceof ApiError && error.status >= 500) {
    return "No pudimos guardar la decision de revision. Intenta nuevamente en unos segundos.";
  }

  return "No pudimos guardar la decision de revision. Vuelve a intentarlo.";
}

function getUpdateAdminTransporterStatusSuccessMessage(
  verificationStatus: AdminTransporterVerificationDecision,
): string {
  return verificationStatus === "VERIFIED"
    ? "El transportista quedo aprobado correctamente."
    : "El transportista quedo marcado como rechazado correctamente.";
}

export function useUpdateAdminTransporterStatus(
  transporterId: string,
): UpdateAdminTransporterStatusResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedStatus, setLastSubmittedStatus] =
    useState<AdminTransporterVerificationDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function submitStatus(
    verificationStatus: AdminTransporterVerificationDecision,
  ): Promise<AdminTransporterDetail | null> {
    setIsSubmitting(true);
    setLastSubmittedStatus(verificationStatus);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedTransporter = await updateAdminTransporterStatus(
        transporterId,
        verificationStatus,
      );

      setSuccessMessage(
        getUpdateAdminTransporterStatusSuccessMessage(verificationStatus),
      );

      return updatedTransporter;
    } catch (error) {
      setError(getUpdateAdminTransporterStatusErrorMessage(error));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    error,
    isSubmitting,
    lastSubmittedStatus,
    resetFeedback: () => {
      setError(null);
      setSuccessMessage(null);
    },
    submitStatus,
    successMessage,
  };
}
