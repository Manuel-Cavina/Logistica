import { getAccessToken } from "@/features/auth/services/session/access-token-store";
import { apiClient } from "@/src/lib/api";
import {
  AdminTransportersListSchema,
  type AdminTransporterListItem,
} from "../types/admin-transporter.types";

const INVALID_ADMIN_TRANSPORTERS_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para admin/transporters.";

function buildAuthorizationHeaders(
  accessToken: string | null,
): HeadersInit | undefined {
  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchAdminTransporters(): Promise<
  AdminTransporterListItem[]
> {
  const response = await apiClient.get<unknown>("/admin/transporters", {
    cache: "no-store",
    headers: buildAuthorizationHeaders(getAccessToken()),
  });
  const parsedResponse = AdminTransportersListSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_ADMIN_TRANSPORTERS_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}
