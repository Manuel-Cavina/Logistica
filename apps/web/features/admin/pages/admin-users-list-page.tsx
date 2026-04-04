"use client";

import { AdminShell } from "../components/admin-shell";
import { AdminStatePanel } from "../components/admin-state-panel";
import { AdminUsersTable } from "../components/admin-users-table";
import { useAdminUsers } from "../hooks/use-admin-users";

export function AdminUsersListPage() {
  const { error, refetch, requestStatus, users } = useAdminUsers();

  return (
    <AdminShell
      description="Listado basico del sistema para revisar nombre, email y rol actual. Esta iteracion usa una fuente mockeada temporal hasta conectar el backend admin/users."
      title="Usuarios"
    >
      {requestStatus === "loading" ? (
        <AdminStatePanel
          description="Estamos preparando el dataset temporal del listado de usuarios."
          title="Cargando usuarios"
        />
      ) : null}

      {requestStatus === "error" ? (
        <AdminStatePanel
          actionLabel="Reintentar"
          description={error ?? "No pudimos cargar el listado basico de usuarios."}
          onAction={refetch}
          title="No pudimos cargar usuarios"
        />
      ) : null}

      {requestStatus === "success" && users.length === 0 ? (
        <AdminStatePanel
          description="No hay usuarios disponibles en el dataset temporal."
          title="No encontramos usuarios"
        />
      ) : null}

      {requestStatus === "success" && users.length > 0 ? (
        <AdminUsersTable users={users} />
      ) : null}
    </AdminShell>
  );
}
