import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import { TransporterVerificationBadge } from "@/features/transporter-onboarding/components/transporter-verification-badge";
import type { AdminTransporterListItem } from "../types/admin-transporter.types";

type AdminTransportersTableProps = {
  transporters: AdminTransporterListItem[];
};

function buildDisplayContact(contactPhone: string | null): string {
  return contactPhone ?? "Sin telefono cargado";
}

export function AdminTransportersTable({
  transporters,
}: AdminTransportersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-border/70 bg-panel/80 px-6 py-4 text-sm font-semibold text-muted">
        <span>Transportista</span>
        <span>Contacto</span>
        <span>Estado</span>
        <span className="text-right">Detalle</span>
      </div>

      <div>
        {transporters.map((transporter, index) => (
          <div
            className={cn(
              "grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_auto] gap-4 px-6 py-5 text-sm text-foreground",
              index < transporters.length - 1 && "border-b border-border/60",
            )}
            key={transporter.id}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {transporter.displayName}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Perfil listo para revision administrativa.
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {buildDisplayContact(transporter.contactPhone)}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Contacto principal del perfil.
              </p>
            </div>

            <div className="flex items-center">
              <TransporterVerificationBadge status={transporter.verificationStatus} />
            </div>

            <div className="flex items-center justify-end">
              <Link
                className="inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5"
                href={`/admin/transporters/${transporter.id}`}
              >
                Ver detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
