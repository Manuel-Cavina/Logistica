"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type DashboardDestination = {
  description: string;
  href: string;
  title: string;
  variant?: "ghost" | "primary";
};

const DASHBOARD_DESTINATIONS: DashboardDestination[] = [
  {
    description: "Volver a la vista principal del area privada.",
    href: "/dashboard",
    title: "Ir al dashboard",
  },
  {
    description: "Continuar con la carga y revision del perfil transportista.",
    href: "/onboarding/transporter",
    title: "Completar onboarding",
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
          Accesos rapidos
        </h2>
        <p className="text-sm leading-6 text-muted">
          Usa estos accesos para moverte entre las rutas privadas disponibles
          despues de iniciar sesion.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DASHBOARD_DESTINATIONS.map(({ description, href, title, variant }) => (
          <Button
            className="h-auto min-h-14 flex-col items-start px-5 py-4 text-left"
            key={href}
            onClick={() => handleNavigation(href)}
            type="button"
            variant={variant}
          >
            <span>{title}</span>
            <span className="text-sm font-normal leading-6 text-current/80">
              {description}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
