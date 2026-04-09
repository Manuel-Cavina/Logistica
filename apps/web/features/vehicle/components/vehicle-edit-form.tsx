'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateVehicleSchema } from '@logistica/shared';
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
import { useUpdateVehicle } from '../hooks/use-update-vehicle';
import type { Vehicle, VehicleUpdateFormValues } from '../types/vehicle.types';

type VehicleEditFormProps = {
  vehicle: Vehicle;
};

export function VehicleEditForm({ vehicle }: VehicleEditFormProps) {
  const router = useRouter();
  const {
    formState: { errors, isDirty, isSubmitted, isValid },
    handleSubmit,
    register,
  } = useForm<VehicleUpdateFormValues>({
    defaultValues: {
      brand: vehicle.brand,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
    },
    mode: 'onChange',
    resolver: zodResolver(UpdateVehicleSchema),
  });
  const { isSubmitting, resetSubmitError, submitError, updateVehicle } =
    useUpdateVehicle(vehicle.id, {
      onSuccess: () => {
        router.push('/vehicles');
      },
    });

  async function onSubmit(values: VehicleUpdateFormValues): Promise<void> {
    resetSubmitError();
    await updateVehicle(values);
  }

  const licensePlateError =
    isSubmitted || errors.licensePlate
      ? errors.licensePlate?.message
      : undefined;
  const brandError =
    isSubmitted || errors.brand ? errors.brand?.message : undefined;
  const modelError =
    isSubmitted || errors.model ? errors.model?.message : undefined;

  return (
    <Card className="border-white/75 bg-white/88 p-6 shadow-[0_18px_40px_rgba(21,40,33,0.08)] sm:p-8">
      <CardHeader className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted">
          Issue #111
        </p>
        <CardTitle>Editar vehicle operativo</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          Ajusta la patente, marca o modelo con el mismo contrato de backend y
          vuelve al hub de flota cuando termines.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="licensePlate"
              >
                Patente
              </label>
              <Input
                autoCapitalize="characters"
                autoCorrect="off"
                disabled={isSubmitting}
                error={licensePlateError}
                id="licensePlate"
                maxLength={8}
                placeholder="Ej: AA123BB"
                {...register('licensePlate')}
              />
              <p className="text-sm leading-6 text-muted">
                Se admiten entre 6 y 8 caracteres alfanumericos.
              </p>
              {licensePlateError ? (
                <p className="text-sm text-destructive/90">
                  {licensePlateError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="brand"
              >
                Marca
              </label>
              <Input
                autoComplete="organization"
                disabled={isSubmitting}
                error={brandError}
                id="brand"
                maxLength={80}
                placeholder="Ej: Scania"
                {...register('brand')}
              />
              {brandError ? (
                <p className="text-sm text-destructive/90">{brandError}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="model"
              >
                Modelo
              </label>
              <Input
                disabled={isSubmitting}
                error={modelError}
                id="model"
                maxLength={80}
                placeholder="Ej: R450"
                {...register('model')}
              />
              {modelError ? (
                <p className="text-sm text-destructive/90">{modelError}</p>
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
