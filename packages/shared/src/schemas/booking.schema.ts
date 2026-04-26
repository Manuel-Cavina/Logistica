import { z } from 'zod';

const cuidSchema = z.string().cuid();

export const CreateBookingSchema = z
  .object({
    tripOfferId: cuidSchema,
    requestedUnits: z
      .number()
      .int('El valor debe ser un numero entero.')
      .positive('El valor debe ser mayor a cero.'),
  })
  .strict();

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

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type BookingView = z.infer<typeof BookingViewSchema>;
