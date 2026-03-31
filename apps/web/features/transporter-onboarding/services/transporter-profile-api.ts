import { NotFoundError, apiClient } from "@/src/lib/api";
import { TransporterProfileSchema, type TransporterProfile } from "../types/transporter-profile.types";

const INVALID_TRANSPORTER_PROFILE_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para transporter/profile.";

export async function fetchTransporterProfile(): Promise<TransporterProfile | null> {
  try {
    const response = await apiClient.get<unknown>("/transporter/profile", {
      cache: "no-store",
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
