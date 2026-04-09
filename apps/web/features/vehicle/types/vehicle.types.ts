import {
  type CreateVehicleDto,
  type UpdateVehicleDto,
  type IVehicleView,
  VehicleViewSchema,
} from '@logistica/shared';

export type Vehicle = IVehicleView;
export type VehicleFormValues = CreateVehicleDto;
export type VehicleUpdateFormValues = UpdateVehicleDto;

export { VehicleViewSchema };
