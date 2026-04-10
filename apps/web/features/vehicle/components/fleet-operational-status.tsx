'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getFleetOperationalStatus } from '../config/fleet-operational-status';
import type { TransporterTrailersRequestStatus } from '../hooks/use-transporter-trailers';
import type { TransporterTrailer } from '../types/fleet.types';

type FleetOperationalStatusProps = {
  error: string | null;
  onRetry: () => void;
  requestStatus: TransporterTrailersRequestStatus;
  trailers: TransporterTrailer[];
};

export function FleetOperationalStatus({
  error,
  onRetry,
  requestStatus,
  trailers,
}: FleetOperationalStatusProps) {
  if (requestStatus === 'loading') {
    return (
      <Card className="border-white/75 bg-white/86 shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
        <CardHeader className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Operatividad minima
          </p>
          <CardTitle className="text-[2rem]">Estado operativo minimo</CardTitle>
          <CardDescription className="text-base leading-7">
            Estamos verificando si ya tenes la flota operativa minima.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (requestStatus === 'error') {
    return (
      <Card className="border-destructive/18 bg-[rgba(177,88,63,0.08)] shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
        <CardHeader className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-destructive/80">
            Operatividad minima
          </p>
          <CardTitle className="text-[2rem]">Estado operativo minimo</CardTitle>
          <CardDescription className="text-base leading-7 text-foreground/78">
            No pudimos verificar tu estado operativo.{' '}
            {error ?? 'Vuelve a intentarlo.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} type="button" variant="ghost">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { operationalStatus } = getFleetOperationalStatus(trailers);

  if (operationalStatus === 'eligible') {
    return (
      <Card className="border-white/75 bg-[linear-gradient(135deg,rgba(28,77,59,0.92),rgba(14,42,32,0.94))] text-primary-foreground shadow-[0_24px_50px_rgba(17,41,33,0.14)]">
        <CardHeader className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/72">
            Operatividad minima
          </p>
          <CardTitle className="text-[2rem]">
            Flota minima lista para la proxima etapa
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-primary-foreground/78">
            Ya cumples con la flota operativa minima para la proxima etapa:
            tenes al menos un trailer activo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const description =
    operationalStatus === 'missing-trailer'
      ? 'Todavia no registraste trailers. Para operar en la proxima etapa necesitas al menos uno activo.'
      : 'Tenes trailers cargados, pero ninguno esta activo.';

  return (
    <Card className="border-amber-200 bg-[linear-gradient(180deg,rgba(255,250,240,0.98),rgba(250,241,223,0.92))] shadow-[0_18px_40px_rgba(21,40,33,0.08)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
          Operatividad minima
        </p>
        <CardTitle className="text-[2rem]">
          Todavia no alcanzas la flota operativa minima
        </CardTitle>
        <CardDescription className="max-w-3xl text-base leading-7 text-foreground/78">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#143428]"
          href="/trailers/new"
        >
          Registrar trailer
        </Link>
      </CardContent>
    </Card>
  );
}
