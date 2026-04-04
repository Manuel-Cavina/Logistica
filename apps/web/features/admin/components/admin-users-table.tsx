import { Card } from "@/components/ui/card";
import type { AdminUserListItem } from "../types/admin-user.types";

type AdminUsersTableProps = {
  users: AdminUserListItem[];
};

function getRoleLabel(role: AdminUserListItem["role"]): string {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "CLIENT":
      return "Cliente";
    case "TRANSPORTER":
      return "Transportista";
  }
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.8fr)_minmax(0,1fr)] gap-4 border-b border-border/70 bg-panel/80 px-6 py-4 text-sm font-semibold text-muted">
        <span>Nombre</span>
        <span>Email</span>
        <span>Rol</span>
      </div>

      <div>
        {users.map((user, index) => (
          <div
            className={`grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.8fr)_minmax(0,1fr)] gap-4 px-6 py-5 text-sm text-foreground ${
              index < users.length - 1 ? "border-b border-border/60" : ""
            }`}
            key={user.id}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {user.name}
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.email}
              </p>
            </div>

            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm font-semibold text-foreground">
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
