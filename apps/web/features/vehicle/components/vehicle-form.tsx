"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateVehicleSchema } from "@logistica/shared";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateVehicle } from "../hooks/use-create-vehicle";
import type { Vehicle, VehicleFormValues } from "../types/vehicle.types";

const DEFAULT_VALUES: VehicleFormValues = {
  brand: "",
  licensePlate: "",
  model: "",
};

export function VehicleForm() {
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null);
  const {
    formState: { errors, isDirty, isSubmitted, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<VehicleFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    resolver: zodResolver(CreateVehicleSchema),
  });
  const { createVehicle, isSubmitting, resetSubmitError, submitError } =
    useCreateVehicle();

  async function onSubmit(values: VehicleFormValues): Promise<void> {
    setCreatedVehicle(null);
    resetSubmitError();
    const vehicle = await createVehicle(values);

    if (!vehicle) {
      return;
    }

    setCreatedVehicle(vehicle);
    reset(DEFAULT_VALUES);
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
          Issue #110
        </p>
        <CardTitle>Registrar un vehicle operativo</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          Esta alta minima te deja cargar un vehicle real contra el backend E3
          ya disponible. La gestion completa de flota queda para la issue #109.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
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
                {...register("licensePlate")}
              />
              <p className="text-sm leading-6 text-muted">
                Se admiten entre 6 y 8 caracteres alfanumericos.
              </p>
              {licensePlateError ? (
                <p className="text-sm text-destructive/90">{licensePlateError}</p>
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
                {...register("brand")}
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
                {...register("model")}
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

          {createdVehicle ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm leading-6 text-primary"
            >
              Vehicle registrado correctamente: {createdVehicle.licensePlate} -{" "}
              {createdVehicle.brand} {createdVehicle.model}.
            </div>
          ) : null}

          <Button
            disabled={!isDirty || !isValid || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Registrando"
            type="submit"
          >
            Registrar vehicle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
