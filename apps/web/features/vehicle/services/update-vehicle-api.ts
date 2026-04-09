import { type UpdateVehicleDto } from '@logistica/shared';
import { apiClient } from '@/src/lib/api';
import { getAccessToken } from '@/features/auth/services/session/access-token-store';
import { VehicleViewSchema, type Vehicle } from '../types/vehicle.types';

const INVALID_UPDATE_VEHICLE_RESPONSE_MESSAGE =
  'La API respondio con un payload invalido para PATCH /vehicles/:id.';

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

export async function updateVehicle(
  vehicleId: string,
  dto: UpdateVehicleDto,
): Promise<Vehicle> {
  const response = await apiClient.patch<unknown>(`/vehicles/${vehicleId}`, {
    body: dto,
    headers: buildAuthorizationHeaders(getAccessToken()),
  });
  const parsed = VehicleViewSchema.safeParse(response.data);

  if (!parsed.success) {
    throw new Error(INVALID_UPDATE_VEHICLE_RESPONSE_MESSAGE);
  }

  return parsed.data;
}
