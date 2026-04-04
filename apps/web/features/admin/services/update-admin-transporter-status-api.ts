import { getAccessToken } from "@/features/auth/services/session/access-token-store";
import { apiClient } from "@/src/lib/api";
import {
  AdminTransporterDetailSchema,
  type AdminTransporterDetail,
  type AdminTransporterVerificationDecision,
} from "../types/admin-transporter.types";

const INVALID_UPDATE_ADMIN_TRANSPORTER_STATUS_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para admin/transporters/:id/verification-status.";

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

export async function updateAdminTransporterStatus(
  transporterId: string,
  verificationStatus: AdminTransporterVerificationDecision,
): Promise<AdminTransporterDetail> {
  const response = await apiClient.patch<unknown>(
    `/admin/transporters/${transporterId}/verification-status`,
    {
      body: {
        verificationStatus,
      },
      cache: "no-store",
      headers: buildAuthorizationHeaders(getAccessToken()),
    },
  );
  const parsedResponse = AdminTransporterDetailSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_UPDATE_ADMIN_TRANSPORTER_STATUS_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}
