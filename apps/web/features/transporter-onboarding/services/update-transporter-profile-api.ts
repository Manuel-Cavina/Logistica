import { apiClient } from "@/src/lib/api";
import { getAccessToken } from "@/features/auth/services/session/access-token-store";
import type { UpdateTransporterProfileDto } from "@logistica/shared";
import {
  TransporterProfileSchema,
  type TransporterProfile,
} from "../types/transporter-profile.types";

const INVALID_UPDATE_TRANSPORTER_PROFILE_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para PATCH transporter/profile.";

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

export async function updateTransporterProfile(
  dto: UpdateTransporterProfileDto,
): Promise<TransporterProfile> {
  const response = await apiClient.patch<unknown>("/transporter/profile", {
    body: dto,
    headers: buildAuthorizationHeaders(getAccessToken()),
  });

  const parsed = TransporterProfileSchema.safeParse(response.data);

  if (!parsed.success) {
    throw new Error(INVALID_UPDATE_TRANSPORTER_PROFILE_RESPONSE_MESSAGE);
  }

  return parsed.data;
}
