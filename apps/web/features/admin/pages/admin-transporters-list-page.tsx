"use client";

import { AdminShell } from "../components/admin-shell";
import { AdminStatePanel } from "../components/admin-state-panel";
import { AdminTransportersTable } from "../components/admin-transporters-table";
import { useAdminTransporters } from "../hooks/use-admin-transporters";

export function AdminTransportersListPage() {
  const { error, refetch, requestStatus, transporters } = useAdminTransporters();

  return (
    <AdminShell
      description="Revisa rapidamente los perfiles de transportistas que ya cargaron su informacion y necesitan seguimiento desde el panel administrativo."
      title="Transportistas"
    >
      {requestStatus === "loading" ? (
        <AdminStatePanel
          description="Estamos consultando el listado actual de transportistas para mostrar la cola de revision."
          title="Cargando transportistas"
        />
      ) : null}

      {requestStatus === "error" ? (
        <AdminStatePanel
          actionLabel="Reintentar"
          description={error ?? "No pudimos cargar el listado de transportistas."}
          onAction={refetch}
          title="No pudimos cargar el listado"
        />
      ) : null}

      {requestStatus === "success" && transporters.length === 0 ? (
        <AdminStatePanel
          description="Todavia no hay transportistas para revisar desde el area admin."
          title="No encontramos transportistas"
        />
      ) : null}

      {requestStatus === "success" && transporters.length > 0 ? (
        <AdminTransportersTable transporters={transporters} />
      ) : null}
    </AdminShell>
  );
}
