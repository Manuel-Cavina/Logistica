"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormSubmit } from "@/src/lib/forms/hooks/useFormSubmit";
import {
  loginSchema,
  type LoginSchemaValues,
} from "@/src/lib/forms/schemas/auth.schema";
import { useLogin } from "../hooks/use-login";

type LoginPageViewProps = {
  justRegistered?: boolean;
};

export function LoginPageView({ justRegistered = false }: LoginPageViewProps) {
  const [showPw, setShowPw] = useState(false);
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
    <div className="auth-wrap">
      <div className="auth-left">
        <Link className="auth-brand" href="/">
          <div className="auth-brand-mark">R</div>
          <div className="auth-brand-word">
            Ruta<em> Directa</em>
          </div>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow">
            <span className="dot" />
            Bienvenido de vuelta
          </div>
          <h2>
            Tu proximo viaje
            <br />
            esta a un <em>click.</em>
          </h2>
          <p>
            Mas de 1.200 traslados completados con transportistas verificados,
            pago protegido y comprobante digital.
          </p>
          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-n">+1.200</div>
              <div className="auth-stat-l">Viajes</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-n">+480</div>
              <div className="auth-stat-l">Camioneros</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-n">4.8</div>
              <div className="auth-stat-l">Calificacion</div>
            </div>
          </div>
        </div>

        <Link className="auth-foot-link" href="/">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver al inicio
        </Link>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <div className="auth-form-eyebrow">Iniciar sesion</div>
            <h1 className="auth-form-title">Hola de nuevo</h1>
            <p className="auth-form-sub">
              Sos nuevo en Ruta Directa?{" "}
              <Link href="/register">Crea tu cuenta gratis</Link>
            </p>
          </div>

          <div className="social-btns" aria-hidden="true">
            <button type="button" className="social-btn" disabled>
              Continuar con Google
            </button>
            <button type="button" className="social-btn" disabled>
              Continuar con Facebook
            </button>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">o con email</span>
            <div className="divider-line" />
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  autoComplete="email"
                  aria-invalid={Boolean(emailError)}
                  className="field-input"
                  disabled={isBusy}
                  id="email"
                  placeholder="tu@email.com"
                  type="email"
                  {...register("email")}
                />
              </div>
              {emailError ? <p className="field-error">{emailError}</p> : null}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">
                Contrasena
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  autoComplete="current-password"
                  aria-invalid={Boolean(passwordError)}
                  className="field-input"
                  disabled={isBusy}
                  id="password"
                  placeholder="Tu contrasena"
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="field-toggle"
                  disabled={isBusy}
                  onClick={() => setShowPw((value) => !value)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              {passwordError ? <p className="field-error">{passwordError}</p> : null}
            </div>

            <div className="field-row">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked disabled={isBusy} />
                Mantener sesion iniciada
              </label>
              <Link className="field-link" href="/forgot-password">
                Olvidaste tu contrasena?
              </Link>
            </div>

            {justRegistered ? (
              <div className="auth-feedback auth-feedback-success" aria-live="polite">
                Tu cuenta fue creada correctamente. Ingresa con tus credenciales
                para continuar.
              </div>
            ) : null}

            {feedbackError ? (
              <div className="auth-feedback auth-feedback-error" aria-live="polite">
                {feedbackError}
              </div>
            ) : null}

            <button
              type="submit"
              className="submit-btn"
              disabled={!isValid || isBusy}
            >
              {isBusy ? "Ingresando" : "Ingresar"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="auth-help">
            Necesitas ayuda? <Link href="/">Contactanos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
