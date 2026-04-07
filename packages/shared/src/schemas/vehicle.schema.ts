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

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;
