import type { TransporterTrailer } from '../types/fleet.types';

export type OperationalStatus =
  | 'eligible'
  | 'missing-trailer'
  | 'missing-active-trailer';

export function getFleetOperationalStatus(trailers: TransporterTrailer[]): {
  hasActiveTrailer: boolean;
  hasAnyTrailer: boolean;
  operationalStatus: OperationalStatus;
} {
  const hasAnyTrailer = trailers.length > 0;
  const hasActiveTrailer = trailers.some((trailer) => trailer.isActive);

  if (!hasAnyTrailer) {
    return {
      hasActiveTrailer,
      hasAnyTrailer,
      operationalStatus: 'missing-trailer',
    };
  }

  if (!hasActiveTrailer) {
    return {
      hasActiveTrailer,
      hasAnyTrailer,
      operationalStatus: 'missing-active-trailer',
    };
  }

  return {
    hasActiveTrailer,
    hasAnyTrailer,
    operationalStatus: 'eligible',
  };
}
