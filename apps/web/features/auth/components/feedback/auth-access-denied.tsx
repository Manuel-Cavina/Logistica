export function AuthAccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-panel p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
          Error 403
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
          No tenes acceso a esta vista
        </h1>
        <p className="mt-3 text-base leading-7 text-muted">
          Tu sesion es valida, pero tu rol actual no puede abrir esta seccion.
        </p>
      </div>
    </main>
  );
}
