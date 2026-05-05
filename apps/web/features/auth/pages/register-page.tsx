"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormSubmit } from "@/src/lib/forms/hooks/useFormSubmit";
import { useRegister } from "../hooks/use-register";
import {
  registerFormDefaultValues,
  registerFormSchema,
} from "../schemas/register-form.schema";
import {
  toRegisterSubmissionValues,
  type RegisterFormFields,
} from "../utils/register-form-values";

function getPwScore(value: string) {
  if (!value) {
    return 0;
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

function getPwClass(score: number): string {
  if (score <= 1) return "weak";
  if (score === 2) return "med";
  return "good";
}

function getPwHint(score: number, empty: boolean): string {
  if (empty) return "Usa al menos 8 caracteres con numeros y mayusculas";
  if (score <= 1) return "Contrasena debil";
  if (score === 2) return "Contrasena regular";
  if (score === 3) return "Contrasena buena";
  return "Contrasena fuerte";
}

export function RegisterPageView() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { error, isLoading, isSuccess, register: registerAccount } = useRegister();
  const {
    formState: { errors, isSubmitted, isValid },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<RegisterFormFields>({
    defaultValues: registerFormDefaultValues,
    mode: "onChange",
    resolver: zodResolver(registerFormSchema),
  });
  const { isSubmitting, submit, submitError } = useFormSubmit(
    (values: RegisterFormFields) =>
      registerAccount(toRegisterSubmissionValues(values)),
  );
  const role = watch("role");
  const password = watch("password");
  const isTransporter = role === "TRANSPORTER";
  const pwScore = getPwScore(password);
  const pwClass = getPwClass(pwScore);
  const pwHint = getPwHint(pwScore, !password);
  const pwHintColor = !password
    ? "var(--c5)"
    : pwScore <= 1
      ? "#ef4444"
      : pwScore === 2
        ? "#eab308"
        : "var(--c4-dark)";
  const isBusy = isLoading || isSubmitting;
  const isDisabled = isBusy || isSuccess;
  const feedbackError = error ?? submitError;

  useEffect(() => {
    if (!isSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        router.push("/login?registered=1");
      });
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSuccess, router]);

  async function onSubmit(values: RegisterFormFields) {
    if (!acceptedTerms) {
      return;
    }

    await submit(values);
  }

  function getFieldError(field: keyof RegisterFormFields) {
    const fieldError = errors[field];

    if (!isSubmitted && !fieldError) {
      return undefined;
    }

    return fieldError?.message;
  }

  function selectRole(nextRole: RegisterFormFields["role"]) {
    setValue("role", nextRole, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
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
            Crear cuenta
          </div>
          <h2>
            Sumate a la red de transporte equino mas <em>confiable.</em>
          </h2>
          <p>Empeza gratis. Sin tarjeta, sin permanencia.</p>

          <div className="bens">
            <div className="ben">
              <div className="ben-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="ben-text">
                <strong>Acceso completo gratis</strong>
                <span>
                  Busca viajes, reserva cupos y coordina directo con
                  transportistas.
                </span>
              </div>
            </div>
            <div className="ben">
              <div className="ben-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="ben-text">
                <strong>Pago siempre protegido</strong>
                <span>
                  Sena retenida hasta que confirmas la entrega del traslado.
                </span>
              </div>
            </div>
            <div className="ben">
              <div className="ben-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <div className="ben-text">
                <strong>Comprobante digital</strong>
                <span>PDF oficial con todos los datos del viaje al finalizar.</span>
              </div>
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

      <div className="auth-right" style={{ overflowY: "auto" }}>
        <div className="auth-form-wrap" style={{ maxWidth: "440px" }}>
          <div className="auth-form-head">
            <div className="auth-form-eyebrow">Crear cuenta</div>
            <h1 className="auth-form-title">Empeza ahora</h1>
            <p className="auth-form-sub">
              Ya tenes cuenta? <Link href="/login">Inicia sesion</Link>
            </p>
          </div>

          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab${role === "CLIENT" ? " active" : ""}`}
              disabled={isDisabled}
              onClick={() => selectRole("CLIENT")}
            >
              <span className="role-tab-icon">EQ</span>
              <span className="role-tab-name">Tengo caballos</span>
              <span className="role-tab-desc">Cliente</span>
            </button>
            <button
              type="button"
              className={`role-tab${role === "TRANSPORTER" ? " active" : ""}`}
              disabled={isDisabled}
              onClick={() => selectRole("TRANSPORTER")}
            >
              <span className="role-tab-icon">TR</span>
              <span className="role-tab-name">Soy camionero</span>
              <span className="role-tab-desc">Transportista</span>
            </button>
          </div>
          {getFieldError("role") ? (
            <p className="field-error">{getFieldError("role")}</p>
          ) : null}

          <div className="social-btns" aria-hidden="true">
            <button type="button" className="social-btn" disabled>
              Continuar con Google
            </button>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">o con email</span>
            <div className="divider-line" />
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {isTransporter ? (
              <div className="field">
                <label className="field-label" htmlFor="displayName">
                  Nombre comercial
                </label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                    </svg>
                  </span>
                  <input
                    autoComplete="organization"
                    aria-invalid={Boolean(getFieldError("displayName"))}
                    className="field-input"
                    disabled={isDisabled}
                    id="displayName"
                    placeholder="Acme Transportes"
                    type="text"
                    {...register("displayName")}
                  />
                </div>
                {getFieldError("displayName") ? (
                  <p className="field-error">{getFieldError("displayName")}</p>
                ) : null}
              </div>
            ) : (
              <div className="field-row-2">
                <div>
                  <label className="field-label" htmlFor="firstName">
                    Nombre
                  </label>
                  <div className="field-wrap">
                    <span className="field-icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      autoComplete="given-name"
                      aria-invalid={Boolean(getFieldError("firstName"))}
                      className="field-input"
                      disabled={isDisabled}
                      id="firstName"
                      placeholder="Maria"
                      type="text"
                      {...register("firstName")}
                    />
                  </div>
                  {getFieldError("firstName") ? (
                    <p className="field-error">{getFieldError("firstName")}</p>
                  ) : null}
                </div>
                <div>
                  <label className="field-label" htmlFor="lastName">
                    Apellido
                  </label>
                  <div className="field-wrap">
                    <span className="field-icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      autoComplete="family-name"
                      aria-invalid={Boolean(getFieldError("lastName"))}
                      className="field-input"
                      disabled={isDisabled}
                      id="lastName"
                      placeholder="Alfonzo"
                      type="text"
                      {...register("lastName")}
                    />
                  </div>
                  {getFieldError("lastName") ? (
                    <p className="field-error">{getFieldError("lastName")}</p>
                  ) : null}
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg
                    width="14"
                    height="14"
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
                  aria-invalid={Boolean(getFieldError("email"))}
                  className="field-input"
                  disabled={isDisabled}
                  id="email"
                  placeholder="tu@email.com"
                  type="email"
                  {...register("email")}
                />
              </div>
              {getFieldError("email") ? (
                <p className="field-error">{getFieldError("email")}</p>
              ) : null}
            </div>

            {!isTransporter ? (
              <div className="field">
                <label className="field-label" htmlFor="phone">
                  Telefono <span className="field-optional">Opcional</span>
                </label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    autoComplete="tel"
                    aria-invalid={Boolean(getFieldError("phone"))}
                    className="field-input"
                    disabled={isDisabled}
                    id="phone"
                    placeholder="+54 9 351..."
                    type="tel"
                    {...register("phone")}
                  />
                </div>
                {getFieldError("phone") ? (
                  <p className="field-error">{getFieldError("phone")}</p>
                ) : null}
              </div>
            ) : null}

            <div className="field">
              <label className="field-label" htmlFor="password">
                Contrasena
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg
                    width="14"
                    height="14"
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
                  autoComplete="new-password"
                  aria-invalid={Boolean(getFieldError("password"))}
                  className="field-input"
                  disabled={isDisabled}
                  id="password"
                  placeholder="Minimo 8 caracteres"
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="field-toggle"
                  disabled={isDisabled}
                  onClick={() => setShowPw((value) => !value)}
                >
                  <svg
                    width="14"
                    height="14"
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
              {getFieldError("password") ? (
                <p className="field-error">{getFieldError("password")}</p>
              ) : null}
              <div className="pw-strength">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`pw-bar${password && item <= pwScore ? ` ${pwClass}` : ""}`}
                  />
                ))}
              </div>
              <div className="pw-hint" style={{ color: pwHintColor }}>
                {pwHint}
              </div>
            </div>

            <div className="terms-row">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                disabled={isDisabled}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <label htmlFor="terms">
                Acepto los <Link href="/">Terminos</Link> y la{" "}
                <Link href="/">Politica de Privacidad</Link>.
              </label>
            </div>

            {isSuccess ? (
              <div className="auth-feedback auth-feedback-success" aria-live="polite">
                Cuenta creada correctamente. Te estamos redirigiendo a iniciar
                sesion.
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
              disabled={!isValid || !acceptedTerms || isDisabled}
            >
              {isBusy ? "Creando cuenta" : "Crear cuenta"}
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
            Ya tenes cuenta? <Link href="/login">Inicia sesion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
