import { NotFoundError, apiClient } from "@/src/lib/api";
import { getAccessToken } from "@/features/auth/services/session/access-token-store";
import { TransporterProfileSchema, type TransporterProfile } from "../types/transporter-profile.types";

const INVALID_TRANSPORTER_PROFILE_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para transporter/profile.";

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

export async function fetchTransporterProfile(): Promise<TransporterProfile | null> {
  try {
    const response = await apiClient.get<unknown>("/transporter/profile", {
      cache: "no-store",
      headers: buildAuthorizationHeaders(getAccessToken()),
    });
    const parsedResponse = TransporterProfileSchema.safeParse(response.data);

    if (!parsedResponse.success) {
      throw new Error(INVALID_TRANSPORTER_PROFILE_RESPONSE_MESSAGE);
    }

    return parsedResponse.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}
