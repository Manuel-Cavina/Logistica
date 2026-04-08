import {
  type CreateVehicleDto,
  type IVehicleView,
  VehicleViewSchema,
} from "@logistica/shared";

export type Vehicle = IVehicleView;
export type VehicleFormValues = CreateVehicleDto;

export { VehicleViewSchema };
