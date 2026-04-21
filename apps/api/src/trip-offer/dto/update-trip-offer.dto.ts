import { z } from 'zod';
import type {
  ITripOfferParamsDto,
  IUpdateTripOfferDto,
} from '@logistica/shared';

export const TripOfferParamsSchema = z.object({
  id: z.string().cuid(),
});

export type TripOfferParamsDto = ITripOfferParamsDto;
export type UpdateTripOfferDto = IUpdateTripOfferDto;
