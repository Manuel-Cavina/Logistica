'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrailerEditForm } from '../components/trailer-edit-form';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';

type TrailerEditPageProps = {
  trailerId: string;
};

function LoadingPanel() {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-border/70 bg-panel/45 p-5">
      <p className="text-sm leading-6 text-muted">
        Cargando el trailer seleccionado para editar.
      </p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-[1.6rem] border border-destructive/20 bg-[rgba(177,88,63,0.06)] p-5">
      <h2 className="text-base font-semibold text-foreground">
        No pudimos abrir este trailer
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
      <Link
        className="mt-4 inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/8"
        href="/vehicles"
      >
        Volver a la flota
      </Link>
    </div>
  );
}

export function TrailerEditPage({ trailerId }: TrailerEditPageProps) {
  const { error, requestStatus, trailers } = useTransporterTrailers();
  const trailer = trailers.find((item) => item.id === trailerId) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4ef_0%,#e7efe7_46%,#d9e4da_100%)] px-6 py-10">
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
                  Fleet actions
                </span>
                <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold text-primary-foreground/88">
                  Edicion dedicada de trailer
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/62">
                  Area protegida del transportista
                </p>
                <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-[2.9rem]">
                  Ajusta un trailer sin salir del flujo de flota
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-primary-foreground/76">
                  La edicion sigue el mismo contrato del backend E3 y vuelve al
                  hub una vez que los cambios se guardan correctamente.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-8 grid gap-3 sm:grid-cols-2">
              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <h2 className="text-sm font-semibold text-primary-foreground">
                  Fuente de verdad del servidor
                </h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/76">
                  Abrimos el trailer desde el listado autenticado y dejamos que
                  la flota vuelva a consultar al backend cuando regreses.
                </p>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4">
                <h2 className="text-sm font-semibold text-primary-foreground">
                  Mismo contrato de validacion
                </h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/76">
                  El formulario usa `UpdateTrailerSchema`, asi que frontend y
                  backend se mantienen alineados.
                </p>
              </article>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/84 p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Antes de guardar
              </p>
              <CardTitle className="text-[2rem]">
                Revisa la operacion del trailer
              </CardTitle>
              <CardDescription className="text-base leading-7">
                Esta vista mantiene el alcance acotado a capacidad, rubro y
                unidad para no mezclar la edicion con otras reglas operativas.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Flujo incluido
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  Carga del trailer, validaciones compartidas, guardado con
                  PATCH y retorno al hub de flota.
                </p>
              </div>

              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[1.4rem] bg-primary/5 px-5 py-3 text-[15px] font-semibold text-foreground transition hover:bg-primary/8"
                href="/vehicles"
              >
                Volver a la flota
              </Link>
            </CardContent>
          </Card>
        </section>

        {requestStatus === 'loading' ? <LoadingPanel /> : null}
        {requestStatus === 'error' ? (
          <ErrorPanel
            message={error ?? 'No pudimos cargar el listado de trailers.'}
          />
        ) : null}
        {requestStatus === 'success' && !trailer ? (
          <ErrorPanel message="No encontramos el trailer seleccionado dentro de tu flota." />
        ) : null}
        {requestStatus === 'success' && trailer ? (
          <TrailerEditForm trailer={trailer} />
        ) : null}
      </div>
    </main>
  );
}
