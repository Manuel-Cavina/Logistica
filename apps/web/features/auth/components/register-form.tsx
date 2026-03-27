"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "@/features/auth/components/role-selector";
import { useRegister } from "@/features/auth/hooks/use-register";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import type {
  RegisterFormValues,
  RegisterRole,
} from "@/features/auth/types/auth.types";

type RegisterFormState = {
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  role: RegisterRole;
};

type RegisterFormField =
  | "displayName"
  | "email"
  | "firstName"
  | "lastName"
  | "password"
  | "phone"
  | "role";

type TouchedFields = Partial<Record<RegisterFormField, boolean>>;
type FormErrors = Partial<Record<RegisterFormField, string>>;

const initialValues: RegisterFormState = {
  role: "CLIENT",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  displayName: "",
};

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.23c0-.67-.06-1.315-.17-1.935H12v3.66h5.5a4.706 4.706 0 0 1-2.04 3.09v2.565h3.3c1.93-1.78 3.045-4.405 3.045-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.075-.915 6.765-2.48l-3.3-2.565c-.915.615-2.085.98-3.465.98-2.66 0-4.915-1.795-5.72-4.21H2.87v2.645A10.22 10.22 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.28 13.725A6.14 6.14 0 0 1 5.96 12c0-.6.11-1.18.32-1.725V7.63H2.87A10.22 10.22 0 0 0 1.78 12c0 1.65.395 3.215 1.09 4.37l3.41-2.645Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.065c1.5 0 2.845.515 3.905 1.525l2.93-2.93C17.07 3.01 14.755 2 12 2A10.22 10.22 0 0 0 2.87 7.63l3.41 2.645c.805-2.415 3.06-4.21 5.72-4.21Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.365 12.195c.03 3.12 2.73 4.16 2.76 4.17-.02.07-.43 1.49-1.425 2.95-.855 1.265-1.74 2.525-3.135 2.55-1.365.025-1.805-.81-3.37-.81-1.56 0-2.05.785-3.345.835-1.35.05-2.38-1.355-3.245-2.615-1.765-2.56-3.115-7.235-1.305-10.38.9-1.565 2.51-2.555 4.255-2.58 1.325-.025 2.575.89 3.37.89.795 0 2.285-1.1 3.85-.94.655.03 2.49.265 3.67 1.995-.095.06-2.19 1.275-2.08 3.795ZM14.285 4.93c.715-.865 1.195-2.065 1.065-3.26-1.03.04-2.275.685-3.015 1.55-.665.765-1.25 1.985-1.09 3.15 1.15.09 2.325-.585 3.04-1.44Z"
        fill="currentColor"
      />
    </svg>
  );
}

function getSubmissionValues(values: RegisterFormState): RegisterFormValues {
  if (values.role === "TRANSPORTER") {
    return {
      role: "TRANSPORTER",
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    };
  }

  return {
    role: "CLIENT",
    email: values.email,
    password: values.password,
    firstName: values.firstName,
    lastName: values.lastName,
    ...(values.phone.trim() ? { phone: values.phone } : {}),
  };
}

function getFieldErrors(values: RegisterFormValues): FormErrors {
  const result = registerSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<FormErrors>((errors, issue) => {
    const field = issue.path[0];

    switch (field) {
      case "email":
        errors.email = "Ingresa un email valido.";
        break;
      case "password":
        errors.password = "La contrasena debe tener entre 8 y 128 caracteres.";
        break;
      case "firstName":
        errors.firstName = "Ingresa el nombre de la persona responsable.";
        break;
      case "lastName":
        errors.lastName = "Ingresa el apellido de la persona responsable.";
        break;
      case "phone":
        errors.phone = "Ingresa un telefono valido o deja el campo vacio.";
        break;
      case "displayName":
        errors.displayName =
          "Ingresa el nombre comercial o identificador del transportista.";
        break;
      case "role":
        errors.role = "Selecciona un perfil de cuenta.";
        break;
      default:
        break;
    }

    return errors;
  }, {});
}

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormState>(initialValues);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const { error, isLoading, isSuccess, register } = useRegister();

  const submissionValues = useMemo(() => getSubmissionValues(values), [values]);
  const allErrors = useMemo(() => getFieldErrors(submissionValues), [submissionValues]);
  const isFormValid = Object.keys(allErrors).length === 0;
  const isTransporter = values.role === "TRANSPORTER";
  const isDisabled = isLoading || isSuccess;

  useEffect(() => {
    if (!isSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        router.push("/login?registered=1");
      });
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSuccess, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouchedFields({
      role: true,
      email: true,
      password: true,
      ...(isTransporter
        ? { displayName: true }
        : { firstName: true, lastName: true, phone: true }),
    });

    if (!isFormValid) {
      return;
    }

    await register(submissionValues);
  }

  function handleBlur(field: RegisterFormField) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function handleTextChange(
    field: Exclude<RegisterFormField, "role">,
    nextValue: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
  }

  function handleRoleChange(role: RegisterRole) {
    setValues((current) => ({
      ...current,
      role,
    }));
    setTouchedFields((current) => ({
      ...current,
      role: true,
    }));
  }

  const visibleErrors: FormErrors = {
    role: touchedFields.role ? allErrors.role : undefined,
    email: touchedFields.email ? allErrors.email : undefined,
    password: touchedFields.password ? allErrors.password : undefined,
    firstName: touchedFields.firstName ? allErrors.firstName : undefined,
    lastName: touchedFields.lastName ? allErrors.lastName : undefined,
    phone: touchedFields.phone ? allErrors.phone : undefined,
    displayName: touchedFields.displayName ? allErrors.displayName : undefined,
  };

  return (
    <Card className="w-full max-w-md bg-[rgba(24, 27, 3, 0.96)] p-7 shadow-[0_20px_45px_rgba(27,67,50,0.08)] sm:p-8">
      <CardHeader className="space-y-3">
        <div className="space-y-3">
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription className="max-w-sm text-base leading-7 text-secondary">
            Elige tu perfil y activa tu acceso para publicar o reservar.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="mt-6">
        <form className="space-y-6" noValidate onSubmit={handleSubmit}>
          <div className="space-y-1">
            <RoleSelector
              disabled={isDisabled}
              onChange={handleRoleChange}
              value={values.role}
            />
            {visibleErrors.role ? (
              <p className="text-sm text-destructive/90">{visibleErrors.role}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-foreground/92" htmlFor="email">
              Email
            </label>
            <Input
              autoComplete="email"
              autoFocus
              disabled={isDisabled}
              error={visibleErrors.email}
              id="email"
              name="email"
              onBlur={() => handleBlur("email")}
              onChange={(event) => handleTextChange("email", event.target.value)}
              placeholder="nombre@empresa.com"
              type="email"
              value={values.email}
            />
            {visibleErrors.email ? (
              <p className="text-sm text-destructive/90">{visibleErrors.email}</p>
            ) : null}
          </div>

          {isTransporter ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  className="text-[13px] font-semibold text-foreground/92"
                  htmlFor="displayName"
                >
                  Nombre comercial
                </label>
                <Input
                  autoComplete="organization"
                  disabled={isDisabled}
                  error={visibleErrors.displayName}
                  id="displayName"
                  name="displayName"
                  onBlur={() => handleBlur("displayName")}
                  onChange={(event) => handleTextChange("displayName", event.target.value)}
                  placeholder="Ej. Acme Transportes"
                  type="text"
                  value={values.displayName}
                />
                {visibleErrors.displayName ? (
                  <p className="text-sm text-destructive/90">
                    {visibleErrors.displayName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-semibold text-foreground/92" htmlFor="password">
                  Contrasena
                </label>
                <Input
                  autoComplete="new-password"
                  disabled={isDisabled}
                  error={visibleErrors.password}
                  id="password"
                  name="password"
                  onBlur={() => handleBlur("password")}
                  onChange={(event) => handleTextChange("password", event.target.value)}
                  placeholder="Crea una contrasena segura"
                  type="password"
                  value={values.password}
                />
                
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label
                    className="text-[13px] font-semibold text-foreground/92"
                    htmlFor="firstName"
                  >
                    Nombre
                  </label>
                  <Input
                    autoComplete="given-name"
                    disabled={isDisabled}
                    error={visibleErrors.firstName}
                    id="firstName"
                    name="firstName"
                    onBlur={() => handleBlur("firstName")}
                    onChange={(event) => handleTextChange("firstName", event.target.value)}
                    placeholder="Nombre"
                    type="text"
                    value={values.firstName}
                  />
                  {visibleErrors.firstName ? (
                    <p className="text-sm text-destructive/90">
                      {visibleErrors.firstName}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label
                    className="text-[13px] font-semibold text-foreground/92"
                    htmlFor="lastName"
                  >
                    Apellido
                  </label>
                  <Input
                    autoComplete="family-name"
                    disabled={isDisabled}
                    error={visibleErrors.lastName}
                    id="lastName"
                    name="lastName"
                    onBlur={() => handleBlur("lastName")}
                    onChange={(event) => handleTextChange("lastName", event.target.value)}
                    placeholder="Apellido"
                    type="text"
                    value={values.lastName}
                  />
                  {visibleErrors.lastName ? (
                    <p className="text-sm text-destructive/90">
                      {visibleErrors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-foreground/92" htmlFor="phone">
                    Telefono
                    <span className="ml-2 text-[10px] font-medium text-secondary/80">
                      Opcional
                    </span>
                  </label>
                  <Input
                    autoComplete="tel"
                    disabled={isDisabled}
                    error={visibleErrors.phone}
                    id="phone"
                    name="phone"
                    onBlur={() => handleBlur("phone")}
                    onChange={(event) => handleTextChange("phone", event.target.value)}
                    placeholder="+54 9 11 1234 5678"
                    type="tel"
                    value={values.phone}
                  />
                  {visibleErrors.phone ? (
                    <p className="text-sm text-destructive/90">{visibleErrors.phone}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-semibold text-foreground/92" htmlFor="password">
                    Contrasena
                  </label>
                  <Input
                    autoComplete="new-password"
                    disabled={isDisabled}
                    error={visibleErrors.password}
                    id="password"
                    name="password"
                    onBlur={() => handleBlur("password")}
                    onChange={(event) => handleTextChange("password", event.target.value)}
                    placeholder="Crea una contrasena segura"
                    type="password"
                    value={values.password}
                  />
                 
                </div>
              </div>
            </>
          )}

          {isSuccess ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-tertiary/20 bg-primary/6 px-4 py-3.5 text-sm leading-6 text-primary"
            >
              Cuenta creada correctamente. Te estamos redirigiendo a iniciar sesion.
            </div>
          ) : null}

          {error ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-destructive/18 bg-[rgba(177,88,63,0.08)] px-4 py-3.5 text-sm leading-6 text-destructive"
            >
              {error}
            </div>
          ) : null}

          <Button
            className="mt-2"
            disabled={!isFormValid || isSuccess}
            isLoading={isLoading}
            loadingText="Creando cuenta"
            type="submit"
          >
            Crear cuenta
          </Button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-secondary/60">
              <span className="h-px flex-1 bg-border/80" />
              Otras opciones
              <span className="h-px flex-1 bg-border/80" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="ghost">
                <GoogleLogo />
                Google
              </Button>
              <Button type="button" variant="ghost">
                <AppleLogo />
                Apple
              </Button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-primary/4 px-5 py-4 text-center">
            <p className="text-sm leading-6 text-secondary">
              ¿Ya tenes cuenta? {" "}
              <Link
                className="font-semibold text-primary transition hover:text-tertiary"
                href="/login"
              >
                Iniciar sesion
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
