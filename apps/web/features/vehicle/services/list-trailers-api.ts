import { getAccessToken } from '@/features/auth/services/session/access-token-store';
import { apiClient } from '@/src/lib/api';
import {
  TrailerListSchema,
  type TransporterTrailer,
} from '../types/fleet.types';

const INVALID_TRAILERS_RESPONSE_MESSAGE =
  'La API respondio con un payload invalido para GET /trailers.';

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

export async function fetchOwnTrailers(): Promise<TransporterTrailer[]> {
  const response = await apiClient.get<unknown>('/trailers', {
    cache: 'no-store',
    headers: buildAuthorizationHeaders(getAccessToken()),
  });
  const parsedResponse = TrailerListSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_TRAILERS_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}
