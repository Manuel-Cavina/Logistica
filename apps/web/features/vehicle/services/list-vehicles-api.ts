import { getAccessToken } from '@/features/auth/services/session/access-token-store';
import { apiClient } from '@/src/lib/api';
import {
  VehicleListSchema,
  type TransporterVehicle,
} from '../types/fleet.types';

const INVALID_VEHICLES_RESPONSE_MESSAGE =
  'La API respondio con un payload invalido para GET /vehicles.';

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

export async function fetchOwnVehicles(): Promise<TransporterVehicle[]> {
  const response = await apiClient.get<unknown>('/vehicles', {
    cache: 'no-store',
    headers: buildAuthorizationHeaders(getAccessToken()),
  });
  const parsedResponse = VehicleListSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_VEHICLES_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}
