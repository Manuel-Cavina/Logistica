import type { Prisma } from '@logistica/database';
import type { ICreateVehicleDto } from '@logistica/shared';

export const vehicleSelect = {
  id: true,
  licensePlate: true,
  brand: true,
  model: true,
  isActive: true,
} satisfies Prisma.VehicleSelect;

export const transporterProfileOwnerSelect = {
  id: true,
} satisfies Prisma.TransporterProfileSelect;

export type CreateVehicleInput = ICreateVehicleDto;
export type VehicleRecord = Prisma.VehicleGetPayload<{
  select: typeof vehicleSelect;
}>;
export type TransporterProfileOwnerRecord = Prisma.TransporterProfileGetPayload<{
  select: typeof transporterProfileOwnerSelect;
}>;
