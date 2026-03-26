export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-panel p-10 shadow-soft">
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
          Logistica
        </span>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground">
          Plataforma de cupos y retornos para transporte.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          El flujo público del MVP empieza por autenticación. Ingresá con una
          cuenta existente para continuar.
        </p>
        <div className="mt-8">
          <a
            className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            href="/login"
          >
            Ir a login
          </a>
        </div>
      </div>
    </main>
  );
}
