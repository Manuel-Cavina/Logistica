import { AccountRoleSchema } from "@logistica/shared";
import { z } from "zod";

export const AdminUserListItemSchema = z.object({
  email: z.string().trim().email().max(320),
  id: z.string().cuid(),
  name: z.string().trim().min(1).max(160),
  role: AccountRoleSchema,
});

export const AdminUsersListSchema = z.array(AdminUserListItemSchema);

export type AdminUserListItem = z.infer<typeof AdminUserListItemSchema>;
