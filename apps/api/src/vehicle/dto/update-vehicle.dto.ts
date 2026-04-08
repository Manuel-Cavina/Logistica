import { z } from 'zod';
import type { IUpdateVehicleDto } from '@logistica/shared';

export const VehicleParamsSchema = z.object({
  id: z.string().cuid(),
});

export type VehicleParamsDto = z.infer<typeof VehicleParamsSchema>;
export type UpdateVehicleDto = IUpdateVehicleDto;
