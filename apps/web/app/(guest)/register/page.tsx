"use client";

import type { ReactNode } from "react";
import { startTransition, useEffect, useState } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

type RegisterSlide = {
  backgroundImage: string;
  backgroundPosition?: string;
  description: string;
  emphasis: string;
  eyebrow: string;
  highlights: TrustHighlight[];
  title: string;
};

type TrustHighlight = {
  description: string;
  icon: ReactNode;
  title: string;
};

const sharedImageOverlay =
  "radial-gradient(circle at 18% 18%, rgba(108,196,255,0.18), transparent 24%), radial-gradient(circle at 84% 20%, rgba(255,204,92,0.18), transparent 18%), linear-gradient(180deg, rgba(30,92,128,0.18), rgba(42,130,114,0.3), rgba(38,88,78,0.5))";

function GreenIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.5 5.5c-5.8.35-9.8 3.4-11.8 9.15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M8.75 18.5c4.55-.25 7.65-2.5 9.25-6.75.6-1.6.8-3.45.5-5.5-2.05-.3-3.9-.1-5.5.5-4.25 1.6-6.5 4.7-6.75 9.25.8 1.05 1.45 1.7 2.5 2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.75 7.25h10.5v7.5H3.75v-7.5Zm10.5 2.25h3.3l2.2 2.45v2.8h-5.5V9.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M7.25 17.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3.5 5.5 6v5.2c0 4.35 2.78 8.4 6.5 9.8 3.72-1.4 6.5-5.45 6.5-9.8V6L12 3.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="m9.3 12.1 1.8 1.8 3.6-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

const registerSlides: RegisterSlide[] = [
  {
    backgroundImage: "url('/images/auth/register-green.jpg')",
    backgroundPosition: "center",
    description:
      "Green software aplicado a la operacion para mover mejor cada viaje, ocupar retornos y bajar el desperdicio logistico.",
    emphasis: "Menos impacto, mas eficiencia real.",
    eyebrow: "Green software",
    highlights: [
      {
        title: "Operacion mas eficiente",
        description: "Menos vacio y mejor uso de capacidad para reducir impacto operativo.",
        icon: <GreenIcon />,
      },
      {
        title: "Huella mas baja",
        description: "Retornos mejor coordinados para mover mejor cada viaje desde el origen.",
        icon: <TruckIcon />,
      },
    ],
    title: "Disena una logistica que reduzca vacio y huella desde el origen.",
  },
  {
    backgroundImage: "url('/images/auth/register-truck.jpg')",
    backgroundPosition: "center",
    description:
      "Convierte free millas en oportunidades visibles para publicar capacidad, activar retornos y capturar demanda con mejor timing.",
    emphasis: "Menos free millas, mas ocupacion util.",
    eyebrow: "Retornos y cupos",
    highlights: [
      {
        title: "Capacidad visible",
        description: "Publica cupos disponibles y transforma trayectos libres en oferta real.",
        icon: <TruckIcon />,
      },
      {
        title: "Mejor ocupacion",
        description: "Los retornos aparecen con contexto para capturar reservas mejor aprovechadas.",
        icon: <GreenIcon />,
      },
    ],
    title: "Cada tramo libre puede transformarse en una reserva que si se mueve.",
  },
  {
    backgroundImage: "url('/images/auth/register-security.jpg')",
    backgroundPosition: "center",
    description:
      "Seguridad operativa, sena confirmada y trazabilidad visible para entrar a una plataforma pensada para confianza desde el primer click.",
    emphasis: "Mas control, menos incertidumbre.",
    eyebrow: "Seguridad y confianza",
    highlights: [
      {
        title: "Acceso protegido",
        description: "Ingreso y coordinacion dentro de un flujo preparado para ambos perfiles.",
        icon: <ShieldIcon />,
      },
      {
        title: "Trazabilidad visible",
        description: "Estados claros y seguimiento operativo para reducir incertidumbre.",
        icon: <TruckIcon />,
      },
    ],
    title: "Reserva dentro de un flujo protegido para clientes y transportistas.",
  },
];

function RegisterInfoPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % registerSlides.length);
      });
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="grid h-full grid-rows-[3fr_1fr] overflow-hidden bg-primary">
      <div className="relative overflow-hidden">
        {registerSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          const transitionClassName =
            index === 0
              ? isActive
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-8 scale-[1.02] opacity-0"
              : index === 1
                ? isActive
                  ? "translate-x-0 scale-100 opacity-100"
                  : "-translate-x-12 scale-[1.01] opacity-0"
                : isActive
                  ? "scale-100 opacity-100"
                  : "scale-[1.08] opacity-0";

          return (
            <article
              key={slide.title}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-out ${transitionClassName}`}
              style={{ zIndex: isActive ? 20 : 10 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `${sharedImageOverlay}, ${slide.backgroundImage}`,
                  backgroundPosition: slide.backgroundPosition ?? "center",
                }}
              />

              <div className="relative flex h-full flex-col justify-end bg-[linear-gradient(180deg,rgba(6,16,13,0.04),rgba(6,16,13,0.14),rgba(6,16,13,0.34))] p-5 sm:p-6">
                <div className="max-w-xl rounded-[2rem]  px-5 py-6 text-primary-foreground   sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/66">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-3 max-w-lg text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl sm:leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/82 sm:text-[15px]">
                    {slide.description}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-primary-foreground">
                    {slide.emphasis}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        <div className="relative z-30 flex h-full flex-col justify-between p-5 sm:p-6">
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

          <div className="flex items-end justify-between gap-4"></div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-primary px-5 py-5 text-primary-foreground sm:px-6 sm:py-6">
        {registerSlides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`${slide.title}-highlights`}
              aria-hidden={!isActive}
              className={`absolute inset-0 px-5 py-5 transition-[opacity,transform] duration-700 ease-out sm:px-6 sm:py-6 ${
                isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ zIndex: isActive ? 20 : 10 }}
            >
              <div className="mx-auto flex h-full max-w-5xl flex-col justify-center">
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {slide.highlights.map((highlight) => (
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
          );
        })}
      </div>
    </div>
  );
}

function RegisterMobilePanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % registerSlides.length);
      });
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeSlide: RegisterSlide = registerSlides[activeIndex] ?? registerSlides[0]!;

  return (
    <div className="overflow-hidden rounded-[2rem] bg-primary text-primary-foreground">
      <div className="relative min-h-[28rem] overflow-hidden">
        {registerSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          const transitionClassName =
            index === 0
              ? isActive
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-8 scale-[1.02] opacity-0"
              : index === 1
                ? isActive
                  ? "translate-x-0 scale-100 opacity-100"
                  : "-translate-x-12 scale-[1.01] opacity-0"
                : isActive
                  ? "scale-100 opacity-100"
                  : "scale-[1.08] opacity-0";

          return (
            <article
              key={`${slide.title}-mobile`}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-out ${transitionClassName}`}
              style={{ zIndex: isActive ? 20 : 10 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `${sharedImageOverlay}, ${slide.backgroundImage}`,
                  backgroundPosition: slide.backgroundPosition ?? "center",
                }}
              />
              <div className="relative flex h-full flex-col justify-between bg-[linear-gradient(180deg,rgba(6,16,13,0.04),rgba(6,16,13,0.14),rgba(6,16,13,0.34))] p-5">
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

                <div className="max-w-xl px-2 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/66">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-3 max-w-lg text-3xl font-semibold leading-tight text-primary-foreground">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/82">
                    {slide.description}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-primary-foreground">
                    {slide.emphasis}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="bg-primary px-4 pb-5 pt-4">
        <div className="grid gap-3">
          {activeSlide.highlights.map((highlight) => (
            <article
              key={`${activeSlide.title}-${highlight.title}`}
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
  );
}

export default function RegisterPage() {
  return (
    <>
      <main className="hidden h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="h-screen bg-primary">
          <RegisterInfoPanel />
        </aside>

        <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))]">
          <div className="flex h-full items-center justify-center px-8 py-10 xl:px-12 xl:py-12">
            <div className="flex w-full items-center justify-center">
              <RegisterForm />
            </div>
          </div>
        </main>
      </main>

      <main className="bg-[linear-gradient(180deg,rgba(249,244,229,0.98),rgba(243,229,197,0.92))] lg:hidden">
        <section className="px-4 pb-4 pt-4 sm:px-6">
          <RegisterMobilePanel />
        </section>

        <section className="px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
          <div className="mx-auto max-w-md">
            <RegisterForm />
          </div>
        </section>
      </main>
    </>
  );
}
