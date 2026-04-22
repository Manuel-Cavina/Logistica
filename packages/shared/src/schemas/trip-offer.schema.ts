import { z } from 'zod';
import { CargoTypeSchema } from './trailer.schema';

const cuidSchema = z.string().cuid();
const tripOfferStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'FULL',
  'CLOSED',
  'CANCELLED',
]);

const requiredTrimmedTextSchema = (
  maxLength: number,
  requiredMessage: string,
) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `El valor no puede superar los ${maxLength} caracteres.`);

const nullableTrimmedTextSchema = (maxLength: number, message: string) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length === 0 ? null : trimmedValue;
  }, z.string().max(maxLength, message).nullable());

const latitudeSchema = z
  .number()
  .min(-90, 'La latitud debe estar entre -90 y 90.')
  .max(90, 'La latitud debe estar entre -90 y 90.');

const longitudeSchema = z
  .number()
  .min(-180, 'La longitud debe estar entre -180 y 180.')
  .max(180, 'La longitud debe estar entre -180 y 180.');

const positiveIntegerSchema = z
  .number()
  .int('El valor debe ser un numero entero.')
  .positive('El valor debe ser mayor a cero.');

const positiveIntegerQuerySchema = z.coerce
  .number()
  .int('El valor debe ser un numero entero.')
  .positive('El valor debe ser mayor a cero.');

const nonNegativeIntegerQuerySchema = z.coerce
  .number()
  .int('El valor debe ser un numero entero.')
  .min(0, 'El valor no puede ser negativo.');

const nonNegativeIntegerSchema = z
  .number()
  .int('El valor debe ser un numero entero.')
  .min(0, 'El valor no puede ser negativo.');

const optionalStrictBooleanQuerySchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}, z.boolean().optional());

type TemporalFields = {
  departureDate?: Date | null;
  departureWindowStart?: Date | null;
  departureWindowEnd?: Date | null;
};

const validateTemporalFields = (
  value: TemporalFields,
  context: z.RefinementCtx,
): void => {
  const hasDepartureDate = value.departureDate instanceof Date;
  const hasWindowStart = value.departureWindowStart instanceof Date;
  const hasWindowEnd = value.departureWindowEnd instanceof Date;
  const hasWindow = hasWindowStart || hasWindowEnd;

  if (hasDepartureDate === hasWindow) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Debes informar una fecha exacta o un rango horario valido, pero no ambos.',
      path: ['departureDate'],
    });
  }

  if (hasWindowStart !== hasWindowEnd) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Debes informar departureWindowStart y departureWindowEnd juntos.',
      path: ['departureWindowStart'],
    });
  }

  if (
    hasWindowStart &&
    hasWindowEnd &&
    value.departureWindowStart!.getTime() >= value.departureWindowEnd!.getTime()
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'departureWindowStart debe ser menor que departureWindowEnd.',
      path: ['departureWindowStart'],
    });
  }
};

export const CreateTripOfferSchema = z
  .object({
    originLabel: requiredTrimmedTextSchema(
      160,
      'Ingresa el origen de la oferta.',
    ),
    originLat: latitudeSchema,
    originLng: longitudeSchema,
    destinationLabel: requiredTrimmedTextSchema(
      160,
      'Ingresa el destino de la oferta.',
    ),
    destinationLat: latitudeSchema,
    destinationLng: longitudeSchema,
    departureDate: z.coerce.date().optional().nullable(),
    departureWindowStart: z.coerce.date().optional().nullable(),
    departureWindowEnd: z.coerce.date().optional().nullable(),
    capacityTotal: positiveIntegerSchema,
    availableCapacity: nonNegativeIntegerSchema.optional(),
    pricePerSlot: nonNegativeIntegerSchema,
    maxDetourKm: nonNegativeIntegerSchema.optional().nullable(),
    notes: nullableTrimmedTextSchema(
      2000,
      'Las notas no pueden superar los 2000 caracteres.',
    ).optional(),
    cancellationPolicy: nullableTrimmedTextSchema(
      1000,
      'La politica de cancelacion no puede superar los 1000 caracteres.',
    ).optional(),
    cargoType: CargoTypeSchema,
    isReturn: z.boolean(),
  })
  .strict()
  .superRefine((value, context) => {
    validateTemporalFields(value, context);

    if (
      value.availableCapacity !== undefined &&
      value.availableCapacity > value.capacityTotal
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'availableCapacity no puede ser mayor que capacityTotal.',
        path: ['availableCapacity'],
      });
    }
  });

export const UpdateTripOfferSchema = z
  .object({
    originLabel: requiredTrimmedTextSchema(
      160,
      'Ingresa el origen de la oferta.',
    ).optional(),
    originLat: latitudeSchema.optional(),
    originLng: longitudeSchema.optional(),
    destinationLabel: requiredTrimmedTextSchema(
      160,
      'Ingresa el destino de la oferta.',
    ).optional(),
    destinationLat: latitudeSchema.optional(),
    destinationLng: longitudeSchema.optional(),
    departureDate: z.coerce.date().optional().nullable(),
    departureWindowStart: z.coerce.date().optional().nullable(),
    departureWindowEnd: z.coerce.date().optional().nullable(),
    capacityTotal: positiveIntegerSchema.optional(),
    availableCapacity: nonNegativeIntegerSchema.optional(),
    pricePerSlot: nonNegativeIntegerSchema.optional(),
    maxDetourKm: nonNegativeIntegerSchema.optional().nullable(),
    notes: nullableTrimmedTextSchema(
      2000,
      'Las notas no pueden superar los 2000 caracteres.',
    ).optional(),
    cancellationPolicy: nullableTrimmedTextSchema(
      1000,
      'La politica de cancelacion no puede superar los 1000 caracteres.',
    ).optional(),
    cargoType: CargoTypeSchema.optional(),
    isReturn: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar la oferta.',
  });

export const TripOfferParamsSchema = z.object({
  id: cuidSchema,
});

export const TripOfferSearchQuerySchema = z
  .object({
    origin: requiredTrimmedTextSchema(160, 'Ingresa el origen de la busqueda.'),
    destination: requiredTrimmedTextSchema(
      160,
      'Ingresa el destino de la busqueda.',
    ),
    date: z.coerce.date({
      required_error: 'Ingresa la fecha de la busqueda.',
      invalid_type_error: 'Ingresa una fecha valida.',
    }),
    requiredCapacity: positiveIntegerQuerySchema,
    minPrice: nonNegativeIntegerQuerySchema.optional(),
    maxPrice: nonNegativeIntegerQuerySchema.optional(),
    verifiedOnly: optionalStrictBooleanQuerySchema,
    maxDetourKm: nonNegativeIntegerQuerySchema.optional(),
    page: positiveIntegerQuerySchema.default(1),
    limit: positiveIntegerQuerySchema.default(10),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.limit > 20) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El limite no puede ser mayor a 20.',
        path: ['limit'],
      });
    }

    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minPrice no puede ser mayor que maxPrice.',
        path: ['minPrice'],
      });
    }
  });

export const TripOfferViewSchema = z.object({
  id: cuidSchema,
  originLabel: z.string().trim().min(1).max(160),
  originLat: z.number(),
  originLng: z.number(),
  destinationLabel: z.string().trim().min(1).max(160),
  destinationLat: z.number(),
  destinationLng: z.number(),
  departureDate: z.date().nullable(),
  departureWindowStart: z.date().nullable(),
  departureWindowEnd: z.date().nullable(),
  capacityTotal: z.number().int().positive(),
  availableCapacity: z.number().int().min(0),
  pricePerSlot: z.number().int().min(0),
  maxDetourKm: z.number().int().min(0).nullable(),
  notes: z.string().max(2000).nullable(),
  cancellationPolicy: z.string().max(1000).nullable(),
  cargoType: CargoTypeSchema,
  isReturn: z.boolean(),
  status: tripOfferStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PublicTripOfferSearchItemSchema = z.object({
  id: cuidSchema,
  originLabel: z.string().trim().min(1).max(160),
  destinationLabel: z.string().trim().min(1).max(160),
  departureDate: z.date().nullable(),
  availableCapacity: z.number().int().min(0),
  pricePerSlot: z.number().int().min(0),
  cargoType: CargoTypeSchema,
  status: tripOfferStatusSchema,
});

export const PublicTripOfferSearchResponseSchema = z.object({
  items: z.array(PublicTripOfferSearchItemSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(20),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type CreateTripOfferDto = z.infer<typeof CreateTripOfferSchema>;
export type UpdateTripOfferDto = z.infer<typeof UpdateTripOfferSchema>;
export type TripOfferParamsDto = z.infer<typeof TripOfferParamsSchema>;
export type TripOfferSearchQueryDto = z.infer<
  typeof TripOfferSearchQuerySchema
>;
export type TripOfferView = z.infer<typeof TripOfferViewSchema>;
export type PublicTripOfferSearchItem = z.infer<
  typeof PublicTripOfferSearchItemSchema
>;
export type PublicTripOfferSearchResponse = z.infer<
  typeof PublicTripOfferSearchResponseSchema
>;
