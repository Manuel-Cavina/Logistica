import { getAccessToken } from "@/features/auth/services/session/access-token-store";
import { NotFoundError, apiClient } from "@/src/lib/api";
import {
  AdminTransporterDetailSchema,
  type AdminTransporterDetail,
} from "../types/admin-transporter.types";

const INVALID_ADMIN_TRANSPORTER_DETAIL_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para admin/transporters/:id.";

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

export async function fetchAdminTransporterDetail(
  transporterId: string,
): Promise<AdminTransporterDetail | null> {
  try {
    const response = await apiClient.get<unknown>(
      `/admin/transporters/${transporterId}`,
      {
        cache: "no-store",
        headers: buildAuthorizationHeaders(getAccessToken()),
      },
    );
    const parsedResponse = AdminTransporterDetailSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error(INVALID_ADMIN_TRANSPORTER_DETAIL_RESPONSE_MESSAGE);
    }

    return parsedResponse.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}
