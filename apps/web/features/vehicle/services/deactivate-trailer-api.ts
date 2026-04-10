import { getAccessToken } from '@/features/auth/services/session/access-token-store';
import { apiClient } from '@/src/lib/api';
import { TrailerViewSchema, type Trailer } from '../types/trailer.types';

const INVALID_DEACTIVATE_TRAILER_RESPONSE_MESSAGE =
  'La API respondio con un payload invalido para PATCH /trailers/:id/deactivate.';

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

export async function deactivateTrailer(trailerId: string): Promise<Trailer> {
  const response = await apiClient.patch<unknown>(
    `/trailers/${trailerId}/deactivate`,
    {
      headers: buildAuthorizationHeaders(getAccessToken()),
    },
  );
  const parsed = TrailerViewSchema.safeParse(response.data);

  if (!parsed.success) {
    throw new Error(INVALID_DEACTIVATE_TRAILER_RESPONSE_MESSAGE);
  }

  return parsed.data;
}
