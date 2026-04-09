'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeactivateVehicle } from '../hooks/use-deactivate-vehicle';
import { useTransporterVehicles } from '../hooks/use-transporter-vehicles';
import type { TransporterVehicle } from '../types/fleet.types';
import {
  EmptyStateCard,
  ErrorStateCard,
  FleetSectionShell,
  LoadingStateCard,
} from './fleet-section-shell';

function getVehicleStatusLabel(isActive: boolean): string {
  return isActive ? 'Activa' : 'Inactiva';
}

function VehiclesList({
  onDeactivate,
  pendingVehicleId,
  vehicles,
}: {
  onDeactivate: (vehicle: TransporterVehicle) => Promise<void>;
  pendingVehicleId: string | null;
  vehicles: TransporterVehicle[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border/70">
      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-border/70 bg-panel/80 px-5 py-4 text-sm font-semibold text-muted">
        <span>Patente</span>
        <span>Marca y modelo</span>
        <span className="text-right">Estado</span>
        <span className="text-right">Acciones</span>
      </div>

      <div className="divide-y divide-border/60 bg-white/55">
        {vehicles.map((vehicle) => {
          const isPending = pendingVehicleId === vehicle.id;

          return (
            <div
              className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto_auto] gap-4 px-5 py-4 text-sm text-foreground"
              key={vehicle.id}
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">
                  {vehicle.licensePlate}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Vehicle operativo de la flota.
                </p>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Marca y modelo cargados.
                </p>
              </div>

              <div className="flex items-center justify-end">
                <span className="inline-flex rounded-full border border-border/70 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/80">
                  {getVehicleStatusLabel(vehicle.isActive)}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-[1rem] bg-primary/5 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary/8"
                  href={`/vehicles/${vehicle.id}/edit`}
                >
                  Editar
                </Link>
                <Button
                  className="h-10 w-auto rounded-[1rem] px-4 text-sm"
                  disabled={!vehicle.isActive}
                  isLoading={isPending}
                  loadingText="Desactivando"
                  onClick={() => void onDeactivate(vehicle)}
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

export function VehicleFleetSection() {
  const {
    error: vehiclesError,
    refetch: refetchVehicles,
    requestStatus: vehiclesStatus,
    vehicles,
  } = useTransporterVehicles();
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const { deactivateVehicle, isSubmitting, resetSubmitError, submitError } =
    useDeactivateVehicle();

  async function handleDeactivate(vehicle: TransporterVehicle): Promise<void> {
    if (!vehicle.isActive) {
      return;
    }

    const confirmed = window.confirm(
      `Vas a desactivar el vehicle ${vehicle.licensePlate}. Podras verlo como inactivo en la flota.`,
    );

    if (!confirmed) {
      return;
    }

    resetSubmitError();
    setPendingVehicleId(vehicle.id);

    try {
      const updatedVehicle = await deactivateVehicle(vehicle.id);

      if (!updatedVehicle) {
        return;
      }

      await refetchVehicles();
    } finally {
      setPendingVehicleId(null);
    }
  }

  return (
    <FleetSectionShell
      description="Listado operativo de vehicles propios, con estado y acciones para mantener la flota al dia."
      eyebrow="Vehicles"
      title="Vehiculos cargados"
    >
      {vehiclesStatus === 'loading' ? (
        <LoadingStateCard
          description="Estamos consultando el estado actual de los vehicles del transportista."
          title="Cargando vehicles"
        />
      ) : null}

      {vehiclesStatus === 'error' ? (
        <ErrorStateCard
          description={vehiclesError ?? 'No pudimos cargar los vehicles.'}
          onRetry={refetchVehicles}
          title="No pudimos cargar vehicles"
        />
      ) : null}

      {vehiclesStatus === 'success' && vehicles.length === 0 ? (
        <EmptyStateCard
          actionHref="/vehicles/new"
          actionLabel="Registrar vehicle"
          description="Aun no hay vehicles cargados para esta cuenta."
          title="No encontramos vehicles"
        />
      ) : null}

      {vehiclesStatus === 'success' && vehicles.length > 0 ? (
        <div className="space-y-4">
          {submitError ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-destructive/18 bg-[rgba(177,88,63,0.08)] px-4 py-3.5 text-sm leading-6 text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          <VehiclesList
            onDeactivate={handleDeactivate}
            pendingVehicleId={isSubmitting ? pendingVehicleId : null}
            vehicles={vehicles}
          />
        </div>
      ) : null}
    </FleetSectionShell>
  );
}
