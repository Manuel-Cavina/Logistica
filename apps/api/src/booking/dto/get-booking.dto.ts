import { z } from 'zod';
import type { IBookingParamsDto } from '@logistica/shared';

export const BookingParamsSchema = z.object({
  id: z.string().cuid(),
});

export type BookingParamsDto = IBookingParamsDto;
