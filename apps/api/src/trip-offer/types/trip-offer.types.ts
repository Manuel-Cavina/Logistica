import type { Prisma } from '@logistica/database';
import type {
  ICreateTripOfferDto,
  ITripOfferSearchQueryDto,
  IPublicTripOfferSearchItem,
  IUpdateTripOfferDto,
} from '@logistica/shared';

export const tripOfferSelect = {
  id: true,
  transporterProfileId: true,
  originLabel: true,
  originLat: true,
  originLng: true,
  destinationLabel: true,
  destinationLat: true,
  destinationLng: true,
  departureDate: true,
  departureWindowStart: true,
  departureWindowEnd: true,
  capacityTotal: true,
  availableCapacity: true,
  pricePerSlot: true,
  maxDetourKm: true,
  notes: true,
  cancellationPolicy: true,
  cargoType: true,
  isReturn: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TripOfferSelect;

export const transporterProfileOwnerSelect = {
  id: true,
} satisfies Prisma.TransporterProfileSelect;

export type CreateTripOfferInput = ICreateTripOfferDto;
export type UpdateTripOfferInput = IUpdateTripOfferDto;
export type SearchTripOffersQuery = ITripOfferSearchQueryDto;
export type PublicTripOfferSearchItem = IPublicTripOfferSearchItem;
export type TripOfferRecord = Prisma.TripOfferGetPayload<{
  select: typeof tripOfferSelect;
}>;
export type TransporterProfileOwnerRecord =
  Prisma.TransporterProfileGetPayload<{
    select: typeof transporterProfileOwnerSelect;
  }>;
export type TripOfferCreateData = Prisma.TripOfferCreateInput;
export type TripOfferUpdateData = Prisma.TripOfferUpdateInput;
export type TripOfferSearchWhereInput = Prisma.TripOfferWhereInput;
export type TripOfferSearchOrderBy = Prisma.TripOfferOrderByWithRelationInput[];
