import { z } from "zod";

const requiredDisplayNameSchema = z
  .string()
  .trim()
  .min(1, "Ingresa el nombre visible del transportista.")
  .max(160, "El nombre visible no puede superar los 160 caracteres.");

const nullableTrimmedTextSchema = (maxLength: number, message: string) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length === 0 ? null : trimmedValue;
  }, z.string().max(maxLength, message).nullable());

export const UpdateTransporterProfileSchema = z
  .object({
    displayName: requiredDisplayNameSchema.optional(),
    businessName: nullableTrimmedTextSchema(
      160,
      "La razon social no puede superar los 160 caracteres.",
    ).optional(),
    contactPhone: nullableTrimmedTextSchema(
      32,
      "Ingresa un telefono valido o deja el campo vacio.",
    ).optional(),
    bio: nullableTrimmedTextSchema(
      1000,
      "La biografia no puede superar los 1000 caracteres.",
    ).optional(),
    maxDetourKmDefault: z
      .number()
      .int("El desvio maximo debe ser un numero entero.")
      .min(0, "El desvio maximo no puede ser negativo.")
      .max(1000, "El desvio maximo no puede superar los 1000 km.")
      .nullable()
      .optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Debes enviar al menos un campo para actualizar el perfil.",
  );

export type UpdateTransporterProfileDto = z.infer<
  typeof UpdateTransporterProfileSchema
>;
