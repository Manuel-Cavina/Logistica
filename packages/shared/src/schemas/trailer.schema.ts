import { z } from 'zod';

export const CargoTypeSchema = z.enum([
  'EQUINE',
  'GENERAL_CARGO',
  'FOOD',
  'PEOPLE',
]);

export const CapacityUnitSchema = z.enum(['SLOT', 'KG', 'M3', 'SEAT']);

export const CreateTrailerSchema = z
  .object({
    totalCapacity: z
      .number()
      .int('La capacidad total debe ser un numero entero.')
      .positive('La capacidad total debe ser mayor a cero.'),
    cargoType: CargoTypeSchema,
    capacityUnit: CapacityUnitSchema,
  })
  .strict();

export const UpdateTrailerSchema = z
  .object({
    totalCapacity: z
      .number()
      .int('La capacidad total debe ser un numero entero.')
      .positive('La capacidad total debe ser mayor a cero.')
      .optional(),
    cargoType: CargoTypeSchema.optional(),
    capacityUnit: CapacityUnitSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar el trailer.',
  });

export type CreateTrailerDto = z.infer<typeof CreateTrailerSchema>;
export type UpdateTrailerDto = z.infer<typeof UpdateTrailerSchema>;
