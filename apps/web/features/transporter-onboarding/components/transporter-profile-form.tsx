"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UpdateTransporterProfileDto } from "@logistica/shared";
import { useUpdateTransporterProfile } from "../hooks/use-update-transporter-profile";
import type { TransporterProfile } from "../types/transporter-profile.types";

// ─── Schema ────────────────────────────────────────────────────────────────────

const transporterProfileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Ingresa el nombre visible del transportista.")
    .max(160, "El nombre visible no puede superar los 160 caracteres."),
  businessName: z
    .string()
    .max(160, "La razon social no puede superar los 160 caracteres."),
  contactPhone: z
    .string()
    .max(32, "Ingresa un telefono valido o deja el campo vacio."),
  bio: z.string().max(1000, "La biografia no puede superar los 1000 caracteres."),
  maxDetourKmDefault: z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (/^\d+$/.test(v) &&
          parseInt(v, 10) >= 0 &&
          parseInt(v, 10) <= 1000),
      "Ingresa un numero entre 0 y 1000, o deja el campo vacio.",
    ),
});

type TransporterProfileFormValues = z.infer<typeof transporterProfileFormSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mapProfileToFormValues(
  profile: TransporterProfile | null,
): TransporterProfileFormValues {
  return {
    displayName: profile?.displayName ?? "",
    businessName: profile?.businessName ?? "",
    contactPhone: profile?.contactPhone ?? "",
    bio: profile?.bio ?? "",
    maxDetourKmDefault:
      profile?.maxDetourKmDefault != null
        ? String(profile.maxDetourKmDefault)
        : "",
  };
}

function buildUpdatePayload(
  values: TransporterProfileFormValues,
): UpdateTransporterProfileDto {
  const nullIfEmpty = (v: string): string | null => {
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  };

  return {
    displayName: values.displayName,
    businessName: nullIfEmpty(values.businessName),
    contactPhone: nullIfEmpty(values.contactPhone),
    bio: nullIfEmpty(values.bio),
    maxDetourKmDefault:
      values.maxDetourKmDefault === ""
        ? null
        : parseInt(values.maxDetourKmDefault, 10),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type TransporterProfileFormProps = {
  defaultProfile: TransporterProfile | null;
  onSuccess: () => void;
};

export function TransporterProfileForm({
  defaultProfile,
  onSuccess,
}: TransporterProfileFormProps) {
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const {
    formState: { errors, isDirty, isSubmitted, isValid },
    handleSubmit,
    register,
  } = useForm<TransporterProfileFormValues>({
    defaultValues: mapProfileToFormValues(defaultProfile),
    mode: "onChange",
    resolver: zodResolver(transporterProfileFormSchema),
  });

  const { isSubmitting, submitError, updateProfile } =
    useUpdateTransporterProfile({
      onSuccess: () => {
        setSavedSuccessfully(true);
        onSuccess();
      },
    });

  const isBusy = isSubmitting;

  async function onSubmit(values: TransporterProfileFormValues): Promise<void> {
    setSavedSuccessfully(false);
    await updateProfile(buildUpdatePayload(values));
  }

  const displayNameError =
    isSubmitted || errors.displayName
      ? errors.displayName?.message
      : undefined;
  const businessNameError =
    isSubmitted || errors.businessName
      ? errors.businessName?.message
      : undefined;
  const contactPhoneError =
    isSubmitted || errors.contactPhone
      ? errors.contactPhone?.message
      : undefined;
  const bioError =
    isSubmitted || errors.bio ? errors.bio?.message : undefined;
  const maxDetourError =
    isSubmitted || errors.maxDetourKmDefault
      ? errors.maxDetourKmDefault?.message
      : undefined;

  return (
    <Card className="p-6 sm:p-8" id="profile-form">
      <CardHeader>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
          Datos del perfil
        </p>
        <CardTitle>Edita tu perfil de transportista</CardTitle>
        <CardDescription>
          Completa los datos de tu perfil. El backend actualiza el estado de
          verificacion automaticamente cuando el perfil tiene la informacion
          minima requerida.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {/* displayName */}
            <div className="space-y-2 sm:col-span-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="displayName"
              >
                Nombre visible{" "}
                <span aria-hidden="true" className="text-destructive/70">
                  *
                </span>
              </label>
              <Input
                autoComplete="organization"
                disabled={isBusy}
                error={displayNameError}
                id="displayName"
                placeholder="Ej: Transportes del Sur"
                {...register("displayName")}
              />
              {displayNameError ? (
                <p className="text-sm text-destructive/90">
                  {displayNameError}
                </p>
              ) : null}
            </div>

            {/* businessName */}
            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="businessName"
              >
                Razon social{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </label>
              <Input
                autoComplete="organization"
                disabled={isBusy}
                error={businessNameError}
                id="businessName"
                placeholder="Ej: Transportes del Sur S.A."
                {...register("businessName")}
              />
              {businessNameError ? (
                <p className="text-sm text-destructive/90">
                  {businessNameError}
                </p>
              ) : null}
            </div>

            {/* contactPhone */}
            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="contactPhone"
              >
                Telefono de contacto{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </label>
              <Input
                autoComplete="tel"
                disabled={isBusy}
                error={contactPhoneError}
                id="contactPhone"
                placeholder="Ej: +54 9 11 1234-5678"
                type="tel"
                {...register("contactPhone")}
              />
              {contactPhoneError ? (
                <p className="text-sm text-destructive/90">
                  {contactPhoneError}
                </p>
              ) : null}
            </div>

            {/* bio */}
            <div className="space-y-2 sm:col-span-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="bio"
              >
                Biografia operativa{" "}
                <span className="font-normal text-muted">(opcional)</span>
              </label>
              <Textarea
                disabled={isBusy}
                error={bioError}
                id="bio"
                placeholder="Describe brevemente tu operacion, zonas de cobertura o especialidad..."
                {...register("bio")}
              />
              {bioError ? (
                <p className="text-sm text-destructive/90">{bioError}</p>
              ) : null}
            </div>

            {/* maxDetourKmDefault */}
            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="maxDetourKmDefault"
              >
                Desvio maximo por defecto (km){" "}
                <span className="font-normal text-muted">(opcional)</span>
              </label>
              <Input
                disabled={isBusy}
                error={maxDetourError}
                id="maxDetourKmDefault"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ej: 50"
                {...register("maxDetourKmDefault")}
              />
              {maxDetourError ? (
                <p className="text-sm text-destructive/90">{maxDetourError}</p>
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

          {savedSuccessfully && !submitError ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm leading-6 text-primary"
            >
              Perfil guardado correctamente. El estado de verificacion se
              actualiza automaticamente desde el servidor.
            </div>
          ) : null}

          <Button
            disabled={!isDirty || !isValid || isBusy}
            isLoading={isBusy}
            loadingText="Guardando"
            type="submit"
          >
            Guardar perfil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
