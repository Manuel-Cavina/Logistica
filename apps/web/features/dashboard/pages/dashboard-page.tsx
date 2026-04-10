'use client';

import { DashboardNavigation } from '../components/dashboard-navigation';
import { LogoutButton } from '@/features/auth/components/feedback/logout-button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { AuthRole } from '@/features/auth/types/auth.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type DashboardCopy = {
  areaLabel: string;
  badgeLabel: string;
  heading: string;
  description: string;
  highlights: Array<{
    description: string;
    title: string;
  }>;
  nextAction: string;
  signals: Array<{
    label: string;
    value: string;
  }>;
  summaryDescription: string;
  summaryLabel: string;
  summaryTitle: string;
};

const DASHBOARD_COPY_BY_ROLE: Record<AuthRole, DashboardCopy> = {
  ADMIN: {
    areaLabel: 'Area privada de administracion',
    badgeLabel: 'Dashboard admin',
    heading: 'Panel operativo de administracion',
    description:
      'La sesion administrativa ya se restauro correctamente. Este panel concentra el contexto actual y los accesos protegidos para supervision.',
    highlights: [
      {
        description:
          'La sesion protegida ya esta disponible para entrar a usuarios, transportistas y supervision sin rehacer bootstrap.',
        title: 'Acceso administrativo listo',
      },
      {
        description:
          'Los accesos prioritarios llevan a las rutas administrativas protegidas mas usadas sin cambiar contratos backend.',
        title: 'Rutas administrativas visibles',
      },
      {
        description:
          'El dashboard funciona como punto de entrada rapido para revisar usuarios y seguimiento operativo.',
        title: 'Entrada mas util',
      },
    ],
    nextAction:
      'Empeza por usuarios o por la revision de transportistas para seguir con la supervision desde el area privada.',
    signals: [
      {
        label: 'Sesion protegida',
        value: 'Bootstrap restaurado',
      },
      {
        label: 'Rol activo',
        value: 'ADMIN',
      },
      {
        label: 'Proximo foco',
        value: 'Usuarios y supervision',
      },
    ],
    summaryDescription:
      'El area protegida ya cuenta con bootstrap de sesion, guards y accesos administrativos. Este dashboard mejora lectura y orientacion para administracion.',
    summaryLabel: 'Lo que ya esta resuelto',
    summaryTitle: 'Resumen rapido del acceso',
  },
  CLIENT: {
    areaLabel: 'Area privada',
    badgeLabel: 'Dashboard protegido',
    heading: 'Panel operativo',
    description:
      'La sesion ya se restauro correctamente. Este panel mantiene visibles el contexto y los accesos protegidos principales.',
    highlights: [
      {
        description:
          'El acceso protegido sigue disponible sin rehacer bootstrap ni perder contexto de sesion.',
        title: 'Base operativa estable',
      },
      {
        description:
          'La navegacion prioriza los accesos mas utiles del area privada sin tocar contratos backend.',
        title: 'Navegacion mas clara',
      },
      {
        description:
          'El panel resume donde estas parado y te deja a un click de las rutas protegidas importantes.',
        title: 'Entrada mas util',
      },
    ],
    nextAction:
      'Usa este panel como punto de partida del area privada y continua por la ruta protegida que necesites.',
    signals: [
      {
        label: 'Sesion protegida',
        value: 'Bootstrap restaurado',
      },
      {
        label: 'Contrato activo',
        value: 'API E2 intacta',
      },
      {
        label: 'Proximo foco',
        value: 'Operacion',
      },
    ],
    summaryDescription:
      'El area protegida ya cuenta con bootstrap de sesion y guards. Este dashboard mejora lectura y orientacion.',
    summaryLabel: 'Lo que ya esta resuelto',
    summaryTitle: 'Resumen rapido del flujo',
  },
  TRANSPORTER: {
    areaLabel: 'Area privada del transportista',
    badgeLabel: 'Dashboard protegido',
    heading: 'Panel operativo del transportista',
    description:
      'La sesion ya se restauro correctamente. Este panel pone en primer plano el contexto, la proxima accion y los accesos protegidos mas importantes sin cambiar la API actual.',
    highlights: [
      {
        description:
          'Tu acceso privado ya esta funcionando y el flujo del onboarding sigue siendo la pieza central para dejar el perfil listo.',
        title: 'Base operativa estable',
      },
      {
        description:
          'La nueva navegacion prioriza contexto, siguiente accion y lectura rapida sin tocar contratos backend.',
        title: 'Navegacion mas clara',
      },
      {
        description:
          'El panel resume donde estas parado y te deja a un click de las rutas protegidas mas importantes.',
        title: 'Entrada mas util',
      },
    ],
    nextAction:
      'Si tu perfil todavia no esta completo, entra al onboarding y continua desde ahi. Si ya esta resuelto, usa este panel como punto de partida del area privada.',
    signals: [
      {
        label: 'Sesion protegida',
        value: 'Bootstrap restaurado',
      },
      {
        label: 'Contrato activo',
        value: 'API E2 intacta',
      },
      {
        label: 'Proximo foco',
        value: 'Flota y operacion',
      },
    ],
    summaryDescription:
      'El area protegida ya cuenta con bootstrap de sesion, guards y onboarding conectado. Este dashboard mejora lectura y orientacion.',
    summaryLabel: 'Lo que ya esta resuelto',
    summaryTitle: 'Resumen rapido del flujo',
  },
};

export default function DashboardPageView() {
  const { user } = useAuth();
  const role = user?.role ?? 'TRANSPORTER';
  const dashboardCopy = DASHBOARD_COPY_BY_ROLE[role];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5eee4_0%,#ebdfcd_52%,#e2d2ba_100%)] px-6 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5rem] top-[-4rem] size-[18rem] rounded-full bg-[#dbe9d6]/55 blur-3xl" />
        <div className="absolute right-[-4rem] top-[8rem] size-[15rem] rounded-full bg-[#f0d3ad]/55 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-[28%] size-[16rem] rounded-full bg-[#c7ddd6]/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-white/35 bg-[linear-gradient(160deg,#1a4d3b_0%,#12312a_48%,#0d1d19_100%)] p-8 text-primary-foreground shadow-[0_30px_60px_rgba(16,39,33,0.18)]">
            <CardHeader className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/88">
                  E2 redesign
                </span>
                <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold text-primary-foreground/88">
                  {dashboardCopy.badgeLabel}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/62">
                  {dashboardCopy.areaLabel}
                </p>
                <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-[2.9rem]">
                  {dashboardCopy.heading}
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-primary-foreground/76">
                  {dashboardCopy.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-8 grid gap-3 sm:grid-cols-3">
              {dashboardCopy.signals.map((signal) => (
                <article
                  className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,26,22,0.52)] px-4 py-4"
                  key={signal.label}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/58">
                    {signal.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-primary-foreground">
                    {signal.value}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/84 p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                {dashboardCopy.summaryLabel}
              </p>
              <CardTitle className="text-[2rem]">
                {dashboardCopy.summaryTitle}
              </CardTitle>
              <CardDescription className="text-base leading-7">
                {dashboardCopy.summaryDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {dashboardCopy.highlights.map((highlight) => (
                <article
                  className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-5 py-4"
                  key={highlight.title}
                >
                  <h2 className="text-base font-semibold text-foreground">
                    {highlight.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/75 bg-white/86 p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Navegacion prioritaria
              </p>
              <CardTitle className="text-[2rem]">
                Segui el recorrido protegido
              </CardTitle>
              <CardDescription className="text-base leading-7">
                {role === 'ADMIN'
                  ? 'Usa este panel como base para entrar rapido a las rutas administrativas disponibles.'
                  : 'Usa el panel como base y el onboarding como proxima accion natural para dejar tu operacion lista.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <DashboardNavigation role={role} />
            </CardContent>
          </Card>

          <Card className="border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,242,233,0.92))] p-7 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
            <CardHeader className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Control de sesion
              </p>
              <CardTitle className="text-[2rem]">
                Sesion activa y contexto visible
              </CardTitle>
              <CardDescription className="text-base leading-7">
                La proteccion de rutas sigue igual. Este bloque solo hace mas
                evidente donde estas, que se conserva y como salir si hace
                falta.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-[1.5rem] border border-primary/12 bg-primary/5 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Estado del acceso
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  No se modifico el backend ni el shape de los datos. El cambio
                  es visual, estructural y de experiencia dentro del area
                  protegida.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-panel/70 px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Siguiente accion recomendada
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/78">
                  {dashboardCopy.nextAction}
                </p>
              </div>

              <LogoutButton />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
