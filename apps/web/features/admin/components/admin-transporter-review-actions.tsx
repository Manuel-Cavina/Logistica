"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminTransporterDetail,
  AdminTransporterVerificationDecision,
} from "../types/admin-transporter.types";

type AdminTransporterReviewActionsProps = {
  error: string | null;
  isSubmitting: boolean;
  lastSubmittedStatus: AdminTransporterVerificationDecision | null;
  onApprove: () => void;
  onReject: () => void;
  successMessage: string | null;
  transporter: AdminTransporterDetail;
};

export function AdminTransporterReviewActions({
  error,
  isSubmitting,
  lastSubmittedStatus,
  onApprove,
  onReject,
  successMessage,
  transporter,
}: AdminTransporterReviewActionsProps) {
  if (transporter.verificationStatus !== "PENDING") {
    return null;
  }

  return (
    <Card className="p-8">
      <CardHeader>
        <CardTitle className="text-[1.8rem]">Acciones de revision</CardTitle>
        <CardDescription className="max-w-3xl text-base leading-7">
          Usa el estado actual del backend para decidir si el perfil queda aprobado
          o requiere rechazo. La validacion final de la transicion vive en la API.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {successMessage ? (
          <div className="rounded-[1.6rem] border border-[#c8e0cf] bg-[#edf8f0] px-4 py-4 text-sm leading-6 text-[#1f5136]">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.6rem] border border-[#e7b9a2] bg-[#fff2ea] px-4 py-4 text-sm leading-6 text-[#7d3b1a]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <Button
            isLoading={isSubmitting && lastSubmittedStatus === "VERIFIED"}
            loadingText="Aprobando"
            onClick={onApprove}
            type="button"
          >
            Aprobar perfil
          </Button>
          <Button
            isLoading={isSubmitting && lastSubmittedStatus === "REJECTED"}
            loadingText="Rechazando"
            onClick={onReject}
            type="button"
            variant="ghost"
          >
            Rechazar perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
