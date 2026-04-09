'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTrailerSchema } from '@logistica/shared';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  TRAILER_CAPACITY_UNIT_LABELS,
  TRAILER_CARGO_TYPE_LABELS,
} from '../config/trailer-option-labels';
import { useCreateTrailer } from '../hooks/use-create-trailer';
import type { Trailer, TrailerFormValues } from '../types/trailer.types';

const DEFAULT_VALUES: TrailerFormValues = {
  capacityUnit: 'SLOT',
  cargoType: 'EQUINE',
  totalCapacity: 4,
};

export function TrailerForm() {
  const [createdTrailer, setCreatedTrailer] = useState<Trailer | null>(null);
  const {
    formState: { errors, isDirty, isSubmitted, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<TrailerFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    resolver: zodResolver(CreateTrailerSchema),
  });
  const { createTrailer, isSubmitting, resetSubmitError, submitError } =
    useCreateTrailer();

  async function onSubmit(values: TrailerFormValues): Promise<void> {
    setCreatedTrailer(null);
    resetSubmitError();
    const trailer = await createTrailer(values);

    if (!trailer) {
      return;
    }

    setCreatedTrailer(trailer);
    reset(DEFAULT_VALUES);
  }

  const totalCapacityError =
    isSubmitted || errors.totalCapacity
      ? errors.totalCapacity?.message
      : undefined;

  return (
    <Card className="border-white/75 bg-white/88 p-6 shadow-[0_18px_40px_rgba(21,40,33,0.08)] sm:p-8">
      <CardHeader className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted">
          Issue #112
        </p>
        <CardTitle>Registrar un trailer operativo</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          Esta alta deja visible la capacidad operativa minima del trailer para
          el MVP, manteniendo alineados frontend y backend con el mismo
          contrato.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <input type="hidden" {...register('cargoType')} />
          <input type="hidden" {...register('capacityUnit')} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="totalCapacity"
              >
                Capacidad total
              </label>
              <Input
                disabled={isSubmitting}
                error={totalCapacityError}
                id="totalCapacity"
                min={1}
                placeholder="Ej: 4"
                step={1}
                type="number"
                {...register('totalCapacity', { valueAsNumber: true })}
              />
              <p className="text-sm leading-6 text-muted">
                Define la cantidad total operativa del trailer para el MVP.
              </p>
              {totalCapacityError ? (
                <p className="text-sm text-destructive/90">
                  {totalCapacityError}
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.4rem] border border-border/70 bg-panel/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Rubro activo en MVP
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {TRAILER_CARGO_TYPE_LABELS[DEFAULT_VALUES.cargoType]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Esta alta usa el rubro operativo actual sin abrir seleccion
                adicional todavia.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-border/70 bg-panel/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Unidad activa en MVP
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {TRAILER_CAPACITY_UNIT_LABELS[DEFAULT_VALUES.capacityUnit]}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                La capacidad se expresa en slots para mantener consistencia con
                el flujo operativo actual.
              </p>
            </div>
          </div>

          {submitError ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-destructive/18 bg-[rgba(177,88,63,0.08)] px-4 py-3.5 text-sm leading-6 text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          {createdTrailer ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm leading-6 text-primary"
            >
              Trailer registrado correctamente: {createdTrailer.totalCapacity}{' '}
              {TRAILER_CAPACITY_UNIT_LABELS[createdTrailer.capacityUnit]} para{' '}
              {TRAILER_CARGO_TYPE_LABELS[createdTrailer.cargoType]}.
            </div>
          ) : null}

          <Button
            disabled={!isDirty || !isValid || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Registrando"
            type="submit"
          >
            Registrar trailer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
