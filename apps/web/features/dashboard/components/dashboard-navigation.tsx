"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type DashboardDestination = {
  eyebrow: string;
  description: string;
  href: string;
  meta: string;
  title: string;
  variant?: "ghost" | "primary";
};

const DASHBOARD_DESTINATIONS: DashboardDestination[] = [
  {
    description:
      "Consulta el resumen del estado actual, la hoja de ruta del area privada y los accesos mas usados.",
    eyebrow: "Panel actual",
    href: "/dashboard",
    meta: "Ruta principal protegida",
    title: "Ver panel del transportista",
  },
  {
    description:
      "Segui con la carga y revision del perfil transportista sin salir del flujo protegido actual.",
    eyebrow: "Siguiente paso",
    href: "/onboarding/transporter",
    meta: "Continua donde lo dejaste",
    title: "Abrir onboarding",
    variant: "ghost",
  },
  {
    description:
      "Carga el vehicle inicial del transportista con feedback de validacion y respuesta real del backend E3.",
    eyebrow: "Nuevo flujo E3",
    href: "/vehicles/new",
    meta: "Alta minima usable",
    title: "Registrar vehicle",
    variant: "ghost",
  },
];

export function DashboardNavigation() {
  const router = useRouter();

  function handleNavigation(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <section aria-labelledby="dashboard-navigation-title" className="mt-8 space-y-4">
      <div className="space-y-2">
        <h2
          className="text-lg font-semibold text-foreground"
          id="dashboard-navigation-title"
        >
          Accesos prioritarios
        </h2>
        <p className="text-sm leading-6 text-muted">
          Usa estos accesos para moverte entre las rutas protegidas mas
          importantes sin perder el contexto de tu sesion.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DASHBOARD_DESTINATIONS.map(
          ({ description, eyebrow, href, meta, title, variant }) => (
          <Button
            className="h-auto min-h-[11rem] flex-col items-start justify-between rounded-[1.8rem] px-5 py-5 text-left"
            key={href}
            onClick={() => handleNavigation(href)}
            type="button"
            variant={variant}
          >
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-current/70">
                {eyebrow}
              </span>
              <span className="block text-lg font-semibold leading-7">{title}</span>
              <span className="block text-sm font-normal leading-6 text-current/80">
                {description}
              </span>
            </div>

            <span className="inline-flex rounded-full border border-current/15 bg-black/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-current/80">
              {meta}
            </span>
          </Button>
          ),
        )}
      </div>
    </section>
  );
}
