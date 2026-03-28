import type { ReactNode } from "react";
import { LoginForm } from "../components/forms/login-form";

const horseBackground = "url('/images/auth/login-hero.jpg')";

const sharedImageOverlay =
  "radial-gradient(circle at 18% 18%, rgba(108,196,255,0.18), transparent 24%), radial-gradient(circle at 84% 20%, rgba(255,204,92,0.18), transparent 18%), linear-gradient(180deg, rgba(30,92,128,0.18), rgba(42,130,114,0.3), rgba(38,88,78,0.5))";

type TrustHighlight = {
  title: string;
  description: string;
  icon: ReactNode;
};

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.5 5.5 6v5.2c0 4.35 2.78 8.4 6.5 9.8 3.72-1.4 6.5-5.45 6.5-9.8V6L12 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="m9.3 12.1 1.8 1.8 3.6-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17 12.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9h3.25c1.8 0 3.25 1.45 3.25 3.25V13" stroke="currentColor" strokeDasharray="2.5 2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function ValueIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v16M7.5 8.25C7.5 6.73 8.84 5.5 10.5 5.5h3c1.66 0 3 1.23 3 2.75S15.16 11 13.5 11h-3c-1.66 0-3 1.23-3 2.75s1.34 2.75 3 2.75h3c1.66 0 3-1.23 3-2.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

const highlights: TrustHighlight[] = [
  {
    title: "Acceso protegido",
    description: "Ingreso seguro para clientes y transportistas autorizados.",
    icon: <ShieldIcon />,
  },
  {
    title: "Operacion trazable",
    description: "Estados visibles para cada reserva y cada tramo del servicio.",
    icon: <RouteIcon />,
  },
  {
    title: "Valor operativo",
    description: "Menos friccion para publicar, reservar y coordinar capacidad.",
    icon: <ValueIcon />,
  },
];

function LeftImagePanel() {
  return (
    <div className="grid h-full grid-rows-[3fr_1fr] overflow-hidden bg-primary">
      <div
        className="overflow-hidden"
        style={{
          backgroundImage: `${sharedImageOverlay}, ${horseBackground}`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6">
          <div className="inline-flex w-fit items-center gap-3 rounded-[1.5rem] px-4 py-3 text-primary-foreground">
            <div className="flex size-10 items-center justify-center border-full bg-transparent text-sm font-semibold tracking-[0.18em]">
              ET
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/62">
                Equine Terra
              </p>
              <p className="text-sm font-medium text-primary-foreground/90">
                Cupos y retornos para transporte equino
              </p>
            </div>
          </div>

          <div className="max-w-xl px-5 py-6 text-primary-foreground sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/68">
              La forma inteligente de mover equinos
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl sm:leading-tight">
              Reserva capacidad confiable y reduci las millas vacias.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/80 sm:text-[15px]">
              Equine Terra conecta transportistas y clientes para publicar cupos,
              encontrar retornos y confirmar reservas con trazabilidad clara desde
              la salida hasta la entrega.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary px-5 py-5 text-primary-foreground sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-center">
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-[1.6rem] border border-white/10 bg-[rgba(20,52,40,0.96)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-primary-foreground">
                  {highlight.icon}
                </div>
                <h2 className="mt-4 text-sm font-semibold">{highlight.title}</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/72">
                  {highlight.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type LoginPageViewProps = {
  justRegistered?: boolean;
};

export function LoginPageView({ justRegistered = false }: LoginPageViewProps) {
  return (
    <>
      <main className="hidden h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="h-screen">
          <LeftImagePanel />
        </aside>

        <main className="h-screen overflow-hidden">
          <div className="flex h-full items-center justify-center px-8 py-10 xl:px-12 xl:py-12">
            <div className="flex w-full items-center justify-center">
              <LoginForm justRegistered={justRegistered} />
            </div>
          </div>
        </main>
      </main>

      <main className="bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))] lg:hidden">
        <section className="px-4 pb-4 pt-4 sm:px-6">
          <div className="min-h-[22rem]">
            <LeftImagePanel />
          </div>
        </section>

        <section className="px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
          <div className="mx-auto max-w-md">
            <LoginForm justRegistered={justRegistered} />
          </div>
        </section>
      </main>
    </>
  );
}
