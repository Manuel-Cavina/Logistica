import { LogoutButton } from "@/features/auth/components/logout-button";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-panel p-10 shadow-soft">
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
          Dashboard
        </span>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground">
          Placeholder de dashboard
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          El flujo base ya restaura la sesion con bootstrap global. La proteccion
          de rutas y los permisos finos quedan para el siguiente modulo de auth.
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}
