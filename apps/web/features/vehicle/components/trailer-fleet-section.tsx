'use client';

import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import {
  TRAILER_CAPACITY_UNIT_LABELS,
  TRAILER_CARGO_TYPE_LABELS,
} from '../config/trailer-option-labels';
import type { TransporterTrailer } from '../types/fleet.types';
import {
  EmptyStateCard,
  ErrorStateCard,
  FleetSectionShell,
  LoadingStateCard,
} from './fleet-section-shell';

function getTrailerStatusLabel(isActive: boolean): string {
  return isActive ? 'Activo' : 'Inactivo';
}

function TrailersList({ trailers }: { trailers: TransporterTrailer[] }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border/70">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-border/70 bg-panel/80 px-5 py-4 text-sm font-semibold text-muted">
        <span>Capacidad</span>
        <span>Rubro y unidad</span>
        <span className="text-right">Estado</span>
      </div>

      <div className="divide-y divide-border/60 bg-white/55">
        {trailers.map((trailer) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-5 py-4 text-sm text-foreground"
            key={trailer.id}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {trailer.totalCapacity}{' '}
                {TRAILER_CAPACITY_UNIT_LABELS[trailer.capacityUnit]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Capacidad total declarada.
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {TRAILER_CARGO_TYPE_LABELS[trailer.cargoType]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Unidad de capacidad:{' '}
                {TRAILER_CAPACITY_UNIT_LABELS[trailer.capacityUnit]}.
              </p>
            </div>

            <div className="flex items-center justify-end">
              <span className="inline-flex rounded-full border border-border/70 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">
                {getTrailerStatusLabel(trailer.isActive)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrailerFleetSection() {
  const {
    error: trailersError,
    refetch: refetchTrailers,
    requestStatus: trailersStatus,
    trailers,
  } = useTransporterTrailers();

  return (
    <FleetSectionShell
      description="Trailers visibles desde el backend real, separados para leer capacidad y rubro sin mezclar con vehicles."
      eyebrow="Trailers"
      title="Trailers cargados"
    >
      {trailersStatus === 'loading' ? (
        <LoadingStateCard
          description="Estamos consultando el estado actual de los trailers del transportista."
          title="Cargando trailers"
        />
      ) : null}

      {trailersStatus === 'error' ? (
        <ErrorStateCard
          description={trailersError ?? 'No pudimos cargar los trailers.'}
          onRetry={refetchTrailers}
          title="No pudimos cargar trailers"
        />
      ) : null}

      {trailersStatus === 'success' && trailers.length === 0 ? (
        <EmptyStateCard
          actionHref="/trailers/new"
          actionLabel="Registrar trailer"
          description="Aun no hay trailers cargados para esta cuenta."
          title="No encontramos trailers"
        />
      ) : null}

      {trailersStatus === 'success' && trailers.length > 0 ? (
        <TrailersList trailers={trailers} />
      ) : null}
    </FleetSectionShell>
  );
}
