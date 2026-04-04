"use client";

import { useEffect, useState } from "react";
import { AdminTransporterDetailCard } from "../components/admin-transporter-detail-card";
import { AdminTransporterReviewActions } from "../components/admin-transporter-review-actions";
import { AdminShell } from "../components/admin-shell";
import { AdminStatePanel } from "../components/admin-state-panel";
import { useAdminTransporterDetail } from "../hooks/use-admin-transporter-detail";
import { useUpdateAdminTransporterStatus } from "../hooks/use-update-admin-transporter-status";
import type { AdminTransporterDetail } from "../types/admin-transporter.types";

type AdminTransporterDetailPageProps = {
  transporterId: string;
};

export function AdminTransporterDetailPage({
  transporterId,
}: AdminTransporterDetailPageProps) {
  const { error, refetch, requestStatus, transporter } =
    useAdminTransporterDetail(transporterId);
  const [resolvedTransporter, setResolvedTransporter] =
    useState<AdminTransporterDetail | null>(null);
  const {
    error: reviewError,
    isSubmitting,
    lastSubmittedStatus,
    resetFeedback,
    submitStatus,
    successMessage,
  } = useUpdateAdminTransporterStatus(transporterId);

  useEffect(() => {
    if (!transporter) {
      setResolvedTransporter(null);
      return;
    }

    setResolvedTransporter(transporter);
  }, [transporter]);

  async function handleStatusUpdate(nextStatus: "VERIFIED" | "REJECTED") {
    const updatedTransporter = await submitStatus(nextStatus);

    if (!updatedTransporter) {
      return;
    }

    setResolvedTransporter(updatedTransporter);
    refetch();
  }

  return (
    <AdminShell
      description="Consulta toda la informacion disponible del perfil del transportista antes de tomar una decision de revision."
      eyebrow="Area admin"
      title="Detalle de transportista"
    >
      {requestStatus === "loading" ? (
        <AdminStatePanel
          description="Estamos consultando la informacion completa del perfil seleccionado."
          title="Cargando detalle del transportista"
        />
      ) : null}

      {requestStatus === "error" ? (
        <AdminStatePanel
          actionLabel="Reintentar"
          description={error ?? "No pudimos cargar el detalle del transportista."}
          onAction={refetch}
          title="No pudimos cargar el detalle"
        />
      ) : null}

      {requestStatus === "not-found" ? (
        <AdminStatePanel
          description="El perfil que intentas revisar no existe o ya no esta disponible en el sistema."
          title="No encontramos este transportista"
        />
      ) : null}

      {requestStatus === "success" && resolvedTransporter ? (
        <>
          <AdminTransporterDetailCard transporter={resolvedTransporter} />
          <AdminTransporterReviewActions
            error={reviewError}
            isSubmitting={isSubmitting}
            lastSubmittedStatus={lastSubmittedStatus}
            onApprove={() => {
              resetFeedback();
              void handleStatusUpdate("VERIFIED");
            }}
            onReject={() => {
              resetFeedback();
              void handleStatusUpdate("REJECTED");
            }}
            successMessage={successMessage}
            transporter={resolvedTransporter}
          />
        </>
      ) : null}
    </AdminShell>
  );
}
