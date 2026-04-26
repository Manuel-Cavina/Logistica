import { z } from 'zod';

const cuidSchema = z.string().cuid();

export const BookingParamsSchema = z.object({
  id: cuidSchema,
});

export const CreateBookingSchema = z
  .object({
    tripOfferId: cuidSchema,
    requestedUnits: z
      .number()
      .int('El valor debe ser un numero entero.')
      .positive('El valor debe ser mayor a cero.'),
  })
  .strict();

export const BookingTripOfferSummarySchema = z.object({
  id: cuidSchema,
  originLabel: z.string().trim().min(1),
  destinationLabel: z.string().trim().min(1),
  departureDate: z.date().nullable(),
  departureWindowStart: z.date().nullable(),
  departureWindowEnd: z.date().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'FULL', 'CLOSED', 'CANCELLED']),
});

export const BookingViewSchema = z.object({
  id: cuidSchema,
  tripOfferId: cuidSchema,
  clientAccountId: cuidSchema,
  requestedUnits: z.number().int().positive(),
  unitPriceSnapshot: z.number().int().min(0),
  totalPriceSnapshot: z.number().int().min(0),
  expiresAt: z.date(),
  status: z.enum([
    'PENDING_PAYMENT',
    'EXPIRED',
    'CONFIRMED',
    'IN_PROGRESS',
    'DELIVERED_PENDING_CONFIRMATION',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BookingDetailSchema = z.object({
  id: cuidSchema,
  tripOfferId: cuidSchema,
  requestedUnits: z.number().int().positive(),
  unitPriceSnapshot: z.number().int().min(0),
  totalPriceSnapshot: z.number().int().min(0),
  expiresAt: z.date(),
  status: z.enum([
    'PENDING_PAYMENT',
    'EXPIRED',
    'CONFIRMED',
    'IN_PROGRESS',
    'DELIVERED_PENDING_CONFIRMATION',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
  tripOffer: BookingTripOfferSummarySchema,
});

export type BookingParamsDto = z.infer<typeof BookingParamsSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type BookingTripOfferSummary = z.infer<
  typeof BookingTripOfferSummarySchema
>;
export type BookingView = z.infer<typeof BookingViewSchema>;
export type BookingDetail = z.infer<typeof BookingDetailSchema>;
