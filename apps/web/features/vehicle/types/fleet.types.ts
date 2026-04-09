import { z } from 'zod';
import {
  TrailerViewSchema,
  VehicleViewSchema,
  type ITrailerView,
  type IVehicleView,
} from '@logistica/shared';

export const VehicleListSchema = z.array(VehicleViewSchema);
export const TrailerListSchema = z.array(TrailerViewSchema);

export type TransporterVehicle = IVehicleView;
export type TransporterTrailer = ITrailerView;
