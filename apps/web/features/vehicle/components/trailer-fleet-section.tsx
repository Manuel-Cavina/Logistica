'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import {
  TRAILER_CAPACITY_UNIT_LABELS,
  TRAILER_CARGO_TYPE_LABELS,
} from '../config/trailer-option-labels';
import { useDeactivateTrailer } from '../hooks/use-deactivate-trailer';
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

function TrailersList({
  isSubmitting,
  onDeactivate,
  pendingTrailerId,
  trailers,
}: {
  isSubmitting: boolean;
  onDeactivate: (trailer: TransporterTrailer) => Promise<void>;
  pendingTrailerId: string | null;
  trailers: TransporterTrailer[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border/70">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-border/70 bg-panel/80 px-5 py-4 text-sm font-semibold text-muted">
        <span>Capacidad</span>
        <span>Rubro y unidad</span>
        <span className="text-right">Estado</span>
        <span className="text-right">Acciones</span>
      </div>

      <div className="divide-y divide-border/60 bg-white/55">
        {trailers.map((trailer) => {
          const isPending = pendingTrailerId === trailer.id;

          return (
            <div
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-4 px-5 py-4 text-sm text-foreground"
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

              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-[1rem] bg-primary/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary/8"
                  href={`/trailers/${trailer.id}/edit`}
                >
                  Editar
                </Link>
                <Button
                  className="h-10 w-auto rounded-[1rem] px-4 text-sm"
                  disabled={isSubmitting || !trailer.isActive}
                  isLoading={isPending}
                  loadingText="Desactivando"
                  onClick={() => void onDeactivate(trailer)}
                  type="button"
                  variant="ghost"
                >
                  Desactivar
                </Button>
              </div>
            </div>
          );
        })}
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
  const [pendingTrailerId, setPendingTrailerId] = useState<string | null>(null);
  const { deactivateTrailer, isSubmitting, resetSubmitError, submitError } =
    useDeactivateTrailer();

  async function handleDeactivate(trailer: TransporterTrailer): Promise<void> {
    if (!trailer.isActive) {
      return;
    }

    const confirmed = window.confirm(
      `Vas a desactivar el trailer de ${trailer.totalCapacity} ${TRAILER_CAPACITY_UNIT_LABELS[trailer.capacityUnit]}. Podras verlo como inactivo en la flota.`,
    );

    if (!confirmed) {
      return;
    }

    resetSubmitError();
    setPendingTrailerId(trailer.id);

    try {
      const updatedTrailer = await deactivateTrailer(trailer.id);

      if (!updatedTrailer) {
        return;
      }

      await refetchTrailers();
    } finally {
      setPendingTrailerId(null);
    }
  }

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
        <div className="space-y-4">
          {submitError ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-destructive/18 bg-[rgba(177,88,63,0.08)] px-4 py-3.5 text-sm leading-6 text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          <TrailersList
            isSubmitting={isSubmitting}
            onDeactivate={handleDeactivate}
            pendingTrailerId={isSubmitting ? pendingTrailerId : null}
            trailers={trailers}
          />
        </div>
      ) : null}
    </FleetSectionShell>
  );
}
