"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "../../hooks/use-login";
import { useFormSubmit } from "@/src/lib/forms/hooks/useFormSubmit";
import {
  loginSchema,
  type LoginSchemaValues,
} from "@/src/lib/forms/schemas/auth.schema";

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

type LoginFormProps = {
  justRegistered?: boolean;
};

export function LoginForm({ justRegistered = false }: LoginFormProps) {
  const { error, isLoading, login } = useLogin();
  const {
    formState: { errors, isValid, isSubmitted },
    handleSubmit,
    register,
  } = useForm<LoginSchemaValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    resolver: zodResolver(loginSchema),
  });
  const { isSubmitting, submit, submitError } = useFormSubmit(login);
  const isBusy = isLoading || isSubmitting;
  const feedbackError = error ?? submitError;
  const emailError = (isSubmitted || errors.email) ? errors.email?.message : undefined;
  const passwordError =
    (isSubmitted || errors.password) ? errors.password?.message : undefined;

  async function onSubmit(values: LoginSchemaValues) {
    await submit(values);
  }

  return (
    <Card className="w-full max-w-md bg-[rgba(24, 27, 3, 0.96)] p-7 shadow-[0_20px_45px_rgba(27,67,50,0.08)] sm:p-8">
      <CardHeader className="space-y-3">
        <div className="space-y-3">
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription className="max-w-sm text-base leading-7 text-secondary">
            Ingresa a tu espacio para gestionar viajes, reservas y seguimiento del
            servicio.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="mt-6">
        <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-foreground/92" htmlFor="email">
              Email
            </label>
            <Input
              autoComplete="email"
              autoFocus
              disabled={isBusy}
              error={emailError}
              id="email"
              placeholder="nombre@empresa.com"
              type="email"
              {...register("email")}
            />
            {emailError ? <p className="text-sm text-destructive/90">{emailError}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label
                className="text-[13px] font-semibold text-foreground/92"
                htmlFor="password"
              >
                Contrasena
              </label>
              <Link
                className="text-sm font-medium text-secondary transition hover:text-primary"
                href="/forgot-password"
              >
                Olvide mi contrasena
              </Link>
            </div>
            <Input
              autoComplete="current-password"
              disabled={isBusy}
              error={passwordError}
              id="password"
              placeholder="Ingresa tu contrasena"
              type="password"
              {...register("password")}
            />
            {passwordError ? (
              <p className="text-sm text-destructive/90">{passwordError}</p>
            ) : null}
          </div>

          {justRegistered ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-tertiary/20 bg-primary/6 px-4 py-3.5 text-sm leading-6 text-primary"
            >
              Tu cuenta fue creada correctamente. Ingresa con tus credenciales para
              continuar.
            </div>
          ) : null}

          {feedbackError ? (
            <div
              aria-live="polite"
              className="rounded-[1.4rem] border border-destructive/18 bg-[rgba(177,88,63,0.08)] px-4 py-3.5 text-sm leading-6 text-destructive"
            >
              {feedbackError}
            </div>
          ) : null}

          <Button
            className="mt-2"
            disabled={!isValid || isBusy}
            isLoading={isBusy}
            loadingText="Ingresando"
            type="submit"
          >
            Iniciar sesion
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
              Todavia no tenes cuenta?{" "}
              <Link
                className="font-semibold text-primary transition hover:text-tertiary"
                href="/register"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
