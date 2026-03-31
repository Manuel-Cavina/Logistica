import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TransporterProfileFormPlaceholderProps = {
  id?: string;
};

const futureFields = [
  "Nombre visible del transportista",
  "Razon social opcional",
  "Telefono de contacto",
  "Biografia operativa",
  "Desvio maximo por defecto",
];

export function TransporterProfileFormPlaceholder({
  id = "profile-form-placeholder",
}: TransporterProfileFormPlaceholderProps) {
  return (
    <Card className="border-dashed bg-panel/92 p-6 sm:p-8" id={id}>
      <CardHeader>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
          Siguiente issue
        </p>
        <CardTitle>Espacio listo para integrar el formulario del perfil</CardTitle>
        <CardDescription>
          En esta issue dejamos preparado el contenedor donde se enchufa la edicion
          real del perfil del transportista sin tener que rehacer la pantalla.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {futureFields.map((field) => (
            <div
              key={field}
              className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted"
            >
              {field}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
