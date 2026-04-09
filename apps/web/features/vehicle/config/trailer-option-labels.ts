import type { TrailerFormValues } from '../types/trailer.types';

export const TRAILER_CARGO_TYPE_LABELS: Record<
  TrailerFormValues['cargoType'],
  string
> = {
  EQUINE: 'Equino',
  FOOD: 'Alimentos',
  GENERAL_CARGO: 'Carga general',
  PEOPLE: 'Personas',
};

export const TRAILER_CAPACITY_UNIT_LABELS: Record<
  TrailerFormValues['capacityUnit'],
  string
> = {
  KG: 'kg',
  M3: 'm3',
  SEAT: 'asiento',
  SLOT: 'slot',
};
