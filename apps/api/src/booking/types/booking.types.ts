import type { Prisma } from '@logistica/database';
import type { IBookingDetail, ICreateBookingDto } from '@logistica/shared';

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

export const bookingCancellationSelect = {
  id: true,
  tripOfferId: true,
  clientAccountId: true,
  requestedUnits: true,
  expiresAt: true,
  status: true,
} satisfies Prisma.BookingSelect;

export const tripOfferBookingSelect = {
  id: true,
  capacityTotal: true,
  availableCapacity: true,
  pricePerSlot: true,
  status: true,
} satisfies Prisma.TripOfferSelect;

export const bookingDetailSelect = {
  id: true,
  tripOfferId: true,
  requestedUnits: true,
  unitPriceSnapshot: true,
  totalPriceSnapshot: true,
  expiresAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  tripOffer: {
    select: {
      id: true,
      originLabel: true,
      destinationLabel: true,
      departureDate: true,
      departureWindowStart: true,
      departureWindowEnd: true,
      status: true,
    },
  },
} satisfies Prisma.BookingSelect;

export type CreateBookingInput = ICreateBookingDto;
export type BookingDetail = IBookingDetail;
export type BookingRecord = Prisma.BookingGetPayload<{
  select: typeof bookingSelect;
}>;
export type BookingCancellationRecord = Prisma.BookingGetPayload<{
  select: typeof bookingCancellationSelect;
}>;
export type BookingDetailRecord = Prisma.BookingGetPayload<{
  select: typeof bookingDetailSelect;
}>;
export type TripOfferBookingRecord = Prisma.TripOfferGetPayload<{
  select: typeof tripOfferBookingSelect;
}>;
