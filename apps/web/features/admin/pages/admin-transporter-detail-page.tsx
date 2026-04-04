"use client";

import { AdminTransporterDetailCard } from "../components/admin-transporter-detail-card";
import { AdminShell } from "../components/admin-shell";
import { AdminStatePanel } from "../components/admin-state-panel";
import { useAdminTransporterDetail } from "../hooks/use-admin-transporter-detail";

type AdminTransporterDetailPageProps = {
  transporterId: string;
};

export function AdminTransporterDetailPage({
  transporterId,
}: AdminTransporterDetailPageProps) {
  const { error, refetch, requestStatus, transporter } =
    useAdminTransporterDetail(transporterId);

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

      {requestStatus === "success" && transporter ? (
        <AdminTransporterDetailCard transporter={transporter} />
      ) : null}
    </AdminShell>
  );
}
