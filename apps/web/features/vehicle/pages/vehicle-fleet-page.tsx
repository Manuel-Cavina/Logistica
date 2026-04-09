'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrailerFleetSection } from '../components/trailer-fleet-section';
import { VehicleFleetSection } from '../components/vehicle-fleet-section';

export default function VehicleFleetPage() {
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
                  Vehicles en /vehicles/new y trailers en /trailers/new
                </p>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                  Acciones
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                  Editar y desactivar vehicles desde el listado
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
                Desde aca tenes la vista general de la flota, el acceso al alta
                minima y ahora tambien el patron base de edicion para vehicles.
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
                href="/trailers/new"
              >
                Registrar trailer
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
                  La pagina mantiene separados vehicles y trailers, pero ahora
                  fija un patron escalable: acciones inline para operar la flota
                  y una ruta dedicada para editar.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <VehicleFleetSection />
          <TrailerFleetSection />
        </section>
      </div>
    </main>
  );
}
