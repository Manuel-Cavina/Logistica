import { z } from "zod";

const LICENSE_PLATE_REGEX = /^[A-Z0-9]{6,8}$/;

const requiredTrimmedTextSchema = (maxLength: number, requiredMessage: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `El valor no puede superar los ${maxLength} caracteres.`);

export const CreateVehicleSchema = z
  .object({
    licensePlate: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(
        z
          .string()
          .regex(LICENSE_PLATE_REGEX, "Ingresa una patente valida."),
      ),
    brand: requiredTrimmedTextSchema(80, "Ingresa la marca del vehicle."),
    model: requiredTrimmedTextSchema(80, "Ingresa el modelo del vehicle."),
  })
  .strict();

export const UpdateVehicleSchema = z
  .object({
    licensePlate: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(
        z
          .string()
          .regex(LICENSE_PLATE_REGEX, 'Ingresa una patente valida.'),
      )
      .optional(),
    brand: requiredTrimmedTextSchema(80, 'Ingresa la marca del vehicle.').optional(),
    model: requiredTrimmedTextSchema(80, 'Ingresa el modelo del vehicle.').optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar el vehicle.',
  });

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;
