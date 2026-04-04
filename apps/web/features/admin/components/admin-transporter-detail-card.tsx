import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterVerificationBadge } from "@/features/transporter-onboarding/components/transporter-verification-badge";
import type { AdminTransporterDetail } from "../types/admin-transporter.types";

type AdminTransporterDetailCardProps = {
  transporter: AdminTransporterDetail;
};

function renderValue(value: string | number | null, emptyLabel = "Sin dato cargado") {
  if (value === null || value === "") {
    return emptyLabel;
  }

  return String(value);
}

export function AdminTransporterDetailCard({
  transporter,
}: AdminTransporterDetailCardProps) {
  return (
    <Card className="p-8">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Link
              className="inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5"
              href="/admin/transporters"
            >
              Volver al listado
            </Link>
            <CardTitle>{transporter.displayName}</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Vista de revision del perfil cargado por el transportista para evaluar su estado actual.
            </CardDescription>
          </div>

          <TransporterVerificationBadge status={transporter.verificationStatus} />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Nombre comercial
          </p>
          <p className="mt-3 text-base leading-7 text-foreground">
            {renderValue(transporter.businessName)}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Telefono de contacto
          </p>
          <p className="mt-3 text-base leading-7 text-foreground">
            {renderValue(transporter.contactPhone)}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Desvio maximo
          </p>
          <p className="mt-3 text-base leading-7 text-foreground">
            {transporter.maxDetourKmDefault === null
              ? "Sin dato cargado"
              : `${transporter.maxDetourKmDefault} km`}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Estado actual
          </p>
          <div className="mt-3">
            <TransporterVerificationBadge status={transporter.verificationStatus} />
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5 md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
            Biografia
          </p>
          <p className="mt-3 text-base leading-7 text-foreground">
            {renderValue(
              transporter.bio,
              "No hay una descripcion adicional cargada para este perfil.",
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
