import type { Prisma } from '@logistica/database';
import type { ICreateTrailerDto, IUpdateTrailerDto } from '@logistica/shared';

export const trailerSelect = {
  id: true,
  totalCapacity: true,
  cargoType: true,
  capacityUnit: true,
  isActive: true,
} satisfies Prisma.TrailerSelect;

export const transporterProfileOwnerSelect = {
  id: true,
} satisfies Prisma.TransporterProfileSelect;

export type CreateTrailerInput = ICreateTrailerDto;
export type UpdateTrailerInput = IUpdateTrailerDto;
export type TrailerRecord = Prisma.TrailerGetPayload<{
  select: typeof trailerSelect;
}>;
export type TransporterProfileOwnerRecord =
  Prisma.TransporterProfileGetPayload<{
    select: typeof transporterProfileOwnerSelect;
  }>;
export type TrailerUpdateData = Prisma.TrailerUpdateInput;
