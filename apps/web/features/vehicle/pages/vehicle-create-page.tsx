import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VehicleForm } from "../components/vehicle-form";

const setupHighlights = [
  {
    description:
      "El contrato backend ya esta listo para crear un vehicle propio del transportista autenticado.",
    title: "Integracion real con E3",
  },
  {
    description:
      "La vista resuelve solo el alta inicial. La seccion completa de flota queda para la issue #109.",
    title: "Alcance acotado y usable",
  },
];

export default function VehicleCreatePage() {
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
                  Frontend E3
                </span>
                <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold text-primary-foreground/88">
                  Alta inicial de vehicle
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/62">
                  Area protegida del transportista
                </p>
                <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-[2.9rem]">
                  Carga tu primer vehicle operativo
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-primary-foreground/76">
                  Esta vista deja lista la alta del vehicle con feedback claro,
                  validaciones coherentes con backend y una entrada simple desde
                  el dashboard, sin meterse todavia en la gestion completa de
                  flota.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-8 grid gap-3 sm:grid-cols-2">
              {setupHighlights.map((highlight) => (
                <article
                  className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4"
                  key={highlight.title}
                >
                  <h2 className="text-sm font-semibold text-primary-foreground">
                    {highlight.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/76">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/84 p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Antes de guardar
              </p>
              <CardTitle className="text-[2rem]">
                Verifica los datos minimos
              </CardTitle>
              <CardDescription className="text-base leading-7">
                La patente debe ser unica y la marca/modelo se validan con el
                mismo contrato compartido que usa el backend.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Flujo incluido
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  Formulario, validaciones, loading, error, exito e integracion
                  real con el endpoint protegido de vehicles.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-primary/12 bg-primary/5 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Siguiente capa
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  Cuando la flota se expanda, la issue #109 sumara listados,
                  acciones y contexto operativo alrededor de este primer alta.
                </p>
              </div>

              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[1.4rem] bg-primary/5 px-5 py-3 text-[15px] font-semibold text-foreground transition hover:bg-primary/8"
                href="/dashboard"
              >
                Volver al dashboard
              </Link>
            </CardContent>
          </Card>
        </section>

        <VehicleForm />
      </div>
    </main>
  );
}
