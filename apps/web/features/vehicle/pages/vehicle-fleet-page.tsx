'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import { useTransporterVehicles } from '../hooks/use-transporter-vehicles';
import type {
  TransporterTrailer,
  TransporterVehicle,
} from '../types/fleet.types';

const CARGO_TYPE_LABELS: Record<TransporterTrailer['cargoType'], string> = {
  EQUINE: 'Equino',
  FOOD: 'Alimentos',
  GENERAL_CARGO: 'Carga general',
  PEOPLE: 'Personas',
};

const CAPACITY_UNIT_LABELS: Record<TransporterTrailer['capacityUnit'], string> =
  {
    KG: 'kg',
    M3: 'm3',
    SEAT: 'asiento',
    SLOT: 'slot',
  };

function getVehicleStatusLabel(isActive: boolean): string {
  return isActive ? 'Activa' : 'Inactiva';
}

function getTrailerStatusLabel(isActive: boolean): string {
  return isActive ? 'Activo' : 'Inactivo';
}

function LoadingStateCard({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="space-y-4 rounded-[1.6rem] border border-dashed border-border/70 bg-panel/45 p-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-44 rounded-full bg-primary/8" />
        <div className="h-4 w-80 max-w-full rounded-full bg-primary/5" />
      </div>
      <div className="space-y-3">
        <div className="h-14 rounded-[1.2rem] bg-black/4" />
        <div className="h-14 rounded-[1.2rem] bg-black/4" />
      </div>
      <p className="text-sm leading-6 text-muted">
        {title}. {description}
      </p>
    </div>
  );
}

function EmptyStateCard({
  actionHref,
  actionLabel,
  description,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-panel/55 p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/8"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ErrorStateCard({
  description,
  onRetry,
  title,
}: {
  description: string;
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-destructive/20 bg-[rgba(177,88,63,0.06)] p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <Button
        className="mt-4 max-w-[12rem]"
        onClick={onRetry}
        type="button"
        variant="ghost"
      >
        Reintentar
      </Button>
    </div>
  );
}

function FleetSectionShell({
  description,
  eyebrow,
  title,
  children,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Card className="overflow-hidden border-white/75 bg-white/86 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
      <CardHeader className="space-y-3 px-7 pt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>
        <CardTitle className="text-[2rem]">{title}</CardTitle>
        <CardDescription className="text-base leading-7">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7">{children}</CardContent>
    </Card>
  );
}

function VehiclesList({ vehicles }: { vehicles: TransporterVehicle[] }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border/70">
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 border-b border-border/70 bg-panel/80 px-5 py-4 text-sm font-semibold text-muted">
        <span>Patente</span>
        <span>Marca y modelo</span>
        <span className="text-right">Estado</span>
      </div>

      <div className="divide-y divide-border/60 bg-white/55">
        {vehicles.map((vehicle) => (
          <div
            className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 px-5 py-4 text-sm text-foreground"
            key={vehicle.id}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {vehicle.licensePlate}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Vehicle activo de la flota.
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
          </div>
        ))}
      </div>
    </div>
  );
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
                {CAPACITY_UNIT_LABELS[trailer.capacityUnit]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Capacidad total declarada.
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {CARGO_TYPE_LABELS[trailer.cargoType]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Unidad de capacidad:{' '}
                {CAPACITY_UNIT_LABELS[trailer.capacityUnit]}.
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

export default function VehicleFleetPage() {
  const {
    error: vehiclesError,
    refetch: refetchVehicles,
    requestStatus: vehiclesStatus,
    vehicles,
  } = useTransporterVehicles();
  const {
    error: trailersError,
    refetch: refetchTrailers,
    requestStatus: trailersStatus,
    trailers,
  } = useTransporterTrailers();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eff4ef_0%,#e7efe7_44%,#d9e4da_100%)] px-6 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-4rem] top-[-5rem] size-[18rem] rounded-full bg-[#c7ddd6]/50 blur-3xl" />
        <div className="absolute right-[-5rem] top-[7rem] size-[15rem] rounded-full bg-[#f0d3ad]/42 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[22%] size-[16rem] rounded-full bg-[#dbe9d6]/55 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden border-white/35 bg-[linear-gradient(160deg,#153f31_0%,#102d24_46%,#0b1b16_100%)] p-8 text-primary-foreground shadow-[0_28px_60px_rgba(16,39,33,0.18)]">
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/88">
                  Fleet hub
                </span>
                <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold text-primary-foreground/88">
                  Vehicles y trailers separados
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/62">
                  Area protegida del transportista
                </p>
                <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-[2.9rem]">
                  Gestiona tu flota desde un solo lugar
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-primary-foreground/76">
                  Este hub consume los listados reales de vehicles y trailers
                  para que veas la flota operativa sin salir del area protegida.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                  Rutas conectadas
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                  GET /vehicles y GET /trailers
                </p>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                  Alta disponible
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                  Seguimos usando /vehicles/new
                </p>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                  Acceso rapido
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                  Entradas claras para administrar la flota
                </p>
              </article>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/84 p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Acciones de flota
              </p>
              <CardTitle className="text-[2rem]">
                Entrada principal de gestion
              </CardTitle>
              <CardDescription className="text-base leading-7">
                Desde aca tenes la vista general de la flota y el acceso al alta
                minima cuando necesites registrar un vehicle nuevo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[1.4rem] bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition hover:bg-[#143428]"
                href="/vehicles/new"
              >
                Registrar vehicle
              </Link>

              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[1.4rem] bg-primary/5 px-5 py-3 text-[15px] font-semibold text-foreground transition hover:bg-primary/8"
                href="/dashboard"
              >
                Volver al dashboard
              </Link>

              <div className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Lo que cambia
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  La pagina separa vehicles y trailers visualmente y ya trabaja
                  contra el backend real en lugar de mockear datos.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <FleetSectionShell
            description="Listado operativo de vehicles propios, con estado y datos base para navegar la flota."
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
              <VehiclesList vehicles={vehicles} />
            ) : null}
          </FleetSectionShell>

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
                description="Aun no hay trailers cargados para esta cuenta."
                title="No encontramos trailers"
              />
            ) : null}

            {trailersStatus === 'success' && trailers.length > 0 ? (
              <TrailersList trailers={trailers} />
            ) : null}
          </FleetSectionShell>
        </section>
      </div>
    </main>
  );
}
