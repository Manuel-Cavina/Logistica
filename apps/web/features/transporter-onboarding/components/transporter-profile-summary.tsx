import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterProfileSummaryProps = {
  profile: TransporterProfile;
};

function getFieldValue(value: string | number | null): string {
  if (value === null) {
    return "Sin completar";
  }

  return String(value);
}

const summaryLabels: Array<{
  key: keyof Pick<
    TransporterProfile,
    "displayName" | "businessName" | "contactPhone" | "bio" | "maxDetourKmDefault"
  >;
  label: string;
}> = [
  { key: "displayName", label: "Nombre visible" },
  { key: "businessName", label: "Razon social" },
  { key: "contactPhone", label: "Telefono de contacto" },
  { key: "bio", label: "Biografia" },
  { key: "maxDetourKmDefault", label: "Desvio maximo por defecto" },
];

export function TransporterProfileSummary({
  profile,
}: TransporterProfileSummaryProps) {
  return (
    <Card className="p-6 sm:p-8">
      <CardHeader>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
          Perfil actual
        </p>
        <CardTitle>Resumen de tu perfil</CardTitle>
        <CardDescription>
          Te mostramos la informacion disponible de tu perfil para que puedas revisarla
          antes de continuar.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          {summaryLabels.map((field) => (
            <div
              key={field.key}
              className="rounded-[1.5rem] border border-border/70 bg-background/70 px-4 py-4"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                {field.label}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-foreground">
                {field.key === "maxDetourKmDefault" && profile.maxDetourKmDefault !== null
                  ? `${profile.maxDetourKmDefault} km`
                  : getFieldValue(profile[field.key])}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
