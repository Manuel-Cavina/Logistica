import { AdminUsersListSchema, type AdminUserListItem } from "../types/admin-user.types";

const MOCK_ADMIN_USERS_PAYLOAD = [
  {
    email: "laura.funes@example.com",
    id: "cm9adminus0000wqz5oy7k8ph1",
    name: "Laura Funes",
    role: "CLIENT",
  },
  {
    email: "transporte.prado@example.com",
    id: "cm9adminus0001wqz5oy7k8ph2",
    name: "Transportes del Prado",
    role: "TRANSPORTER",
  },
  {
    email: "ops.admin@example.com",
    id: "cm9adminus0002wqz5oy7k8ph3",
    name: "Operaciones Admin",
    role: "ADMIN",
  },
] as const;

const INVALID_ADMIN_USERS_MOCK_RESPONSE_MESSAGE =
  "El dataset mockeado de admin/users es invalido.";

export async function fetchAdminUsersMock(): Promise<AdminUserListItem[]> {
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });

  const parsedResponse = AdminUsersListSchema.safeParse(MOCK_ADMIN_USERS_PAYLOAD);

  if (!parsedResponse.success) {
    throw new Error(INVALID_ADMIN_USERS_MOCK_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}
