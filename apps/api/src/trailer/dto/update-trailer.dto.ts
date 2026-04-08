import { z } from 'zod';
import type { IUpdateTrailerDto } from '@logistica/shared';

export const TrailerParamsSchema = z.object({
  id: z.string().cuid(),
});

export type TrailerParamsDto = z.infer<typeof TrailerParamsSchema>;
export type UpdateTrailerDto = IUpdateTrailerDto;
