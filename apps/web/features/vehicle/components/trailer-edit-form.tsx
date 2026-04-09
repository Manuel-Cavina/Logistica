'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CapacityUnitSchema,
  CargoTypeSchema,
  UpdateTrailerSchema,
} from '@logistica/shared';
import { useRouter } from 'next/navigation';
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
import { useUpdateTrailer } from '../hooks/use-update-trailer';
import type { Trailer, TrailerUpdateFormValues } from '../types/trailer.types';

const cargoTypeOptions = CargoTypeSchema.options;
const capacityUnitOptions = CapacityUnitSchema.options;

type TrailerEditFormProps = {
  trailer: Trailer;
};

export function TrailerEditForm({ trailer }: TrailerEditFormProps) {
  const router = useRouter();
  const {
    formState: { errors, isDirty, isSubmitted, isValid },
    handleSubmit,
    register,
  } = useForm<TrailerUpdateFormValues>({
    defaultValues: {
      capacityUnit: trailer.capacityUnit,
      cargoType: trailer.cargoType,
      totalCapacity: trailer.totalCapacity,
    },
    mode: 'onChange',
    resolver: zodResolver(UpdateTrailerSchema),
  });
  const { isSubmitting, resetSubmitError, submitError, updateTrailer } =
    useUpdateTrailer(trailer.id, {
      onSuccess: () => {
        router.push('/vehicles');
      },
    });

  async function onSubmit(values: TrailerUpdateFormValues): Promise<void> {
    resetSubmitError();
    await updateTrailer(values);
  }

  const totalCapacityError =
    isSubmitted || errors.totalCapacity
      ? errors.totalCapacity?.message
      : undefined;
  const cargoTypeError =
    isSubmitted || errors.cargoType ? errors.cargoType?.message : undefined;
  const capacityUnitError =
    isSubmitted || errors.capacityUnit
      ? errors.capacityUnit?.message
      : undefined;

  return (
    <Card className="border-white/75 bg-white/88 p-6 shadow-[0_18px_40px_rgba(21,40,33,0.08)] sm:p-8">
      <CardHeader className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted">
          Issue #113
        </p>
        <CardTitle>Editar trailer operativo</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          Ajusta la capacidad, el rubro y la unidad del trailer con el mismo
          contrato del backend y vuelve al hub cuando termines.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
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
                Ajusta la capacidad total operativa del trailer.
              </p>
              {totalCapacityError ? (
                <p className="text-sm text-destructive/90">
                  {totalCapacityError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="cargoType"
              >
                Rubro
              </label>
              <select
                aria-invalid={cargoTypeError ? 'true' : 'false'}
                className="flex h-14 w-full rounded-[1.2rem] border border-border/80 bg-input px-4 text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] outline-none transition focus-visible:border-tertiary focus-visible:ring-4 focus-visible:ring-primary/12"
                disabled={isSubmitting}
                id="cargoType"
                {...register('cargoType')}
              >
                {cargoTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {TRAILER_CARGO_TYPE_LABELS[option]}
                  </option>
                ))}
              </select>
              {cargoTypeError ? (
                <p className="text-sm text-destructive/90">{cargoTypeError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="capacityUnit"
              >
                Unidad
              </label>
              <select
                aria-invalid={capacityUnitError ? 'true' : 'false'}
                className="flex h-14 w-full rounded-[1.2rem] border border-border/80 bg-input px-4 text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] outline-none transition focus-visible:border-tertiary focus-visible:ring-4 focus-visible:ring-primary/12"
                disabled={isSubmitting}
                id="capacityUnit"
                {...register('capacityUnit')}
              >
                {capacityUnitOptions.map((option) => (
                  <option key={option} value={option}>
                    {TRAILER_CAPACITY_UNIT_LABELS[option]}
                  </option>
                ))}
              </select>
              {capacityUnitError ? (
                <p className="text-sm text-destructive/90">
                  {capacityUnitError}
                </p>
              ) : null}
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={!isDirty || !isValid || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Guardando"
              type="submit"
            >
              Guardar cambios
            </Button>

            <Button
              className="sm:max-w-[14rem]"
              disabled={isSubmitting}
              onClick={() => router.push('/vehicles')}
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
