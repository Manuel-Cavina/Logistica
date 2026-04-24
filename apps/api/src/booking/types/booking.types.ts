import type { Prisma } from '@logistica/database';
import type { ICreateBookingDto } from '@logistica/shared';

export const bookingSelect = {
  id: true,
  tripOfferId: true,
  clientAccountId: true,
  requestedUnits: true,
  unitPriceSnapshot: true,
  totalPriceSnapshot: true,
  expiresAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BookingSelect;

export const tripOfferBookingSelect = {
  id: true,
  pricePerSlot: true,
  status: true,
} satisfies Prisma.TripOfferSelect;

export type CreateBookingInput = ICreateBookingDto;
export type BookingRecord = Prisma.BookingGetPayload<{
  select: typeof bookingSelect;
}>;
export type TripOfferBookingRecord = Prisma.TripOfferGetPayload<{
  select: typeof tripOfferBookingSelect;
}>;
