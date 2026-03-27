"use client";

import { RegisterResponseSchema } from "@logistica/shared";
import { useState } from "react";
import { buildApiUrl } from "@/lib/api";
import type {
  RegisterFormValues,
  RegisterResponse,
  RegisterState,
} from "../types/auth.types";
import { RegisterRequestError } from "../types/auth.types";

type FetchLike = typeof fetch;

const DEFAULT_ERROR_MESSAGE =
  "No se pudo completar el registro. Intenta nuevamente en unos segundos.";

export async function registerRequest(
  values: RegisterFormValues,
  fetchImplementation: FetchLike = fetch,
): Promise<RegisterResponse> {
  const response = await fetchImplementation(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(values),
  });

  if (response.status === 400) {
    throw new RegisterRequestError(
      "INVALID_PAYLOAD",
      "No se pudo completar el registro con los datos ingresados.",
      response.status,
    );
  }

  if (response.status === 429) {
    throw new RegisterRequestError(
      "RATE_LIMITED",
      "Superaste el limite de intentos. Espera unos minutos y proba otra vez.",
      response.status,
    );
  }

  if (!response.ok) {
    throw new RegisterRequestError(
      "SERVER_ERROR",
      DEFAULT_ERROR_MESSAGE,
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new RegisterRequestError(
      "INVALID_RESPONSE",
      "La API respondio con un formato invalido.",
      response.status,
    );
  }

  const parsedPayload = RegisterResponseSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new RegisterRequestError(
      "INVALID_RESPONSE",
      "La API respondio con un formato invalido.",
      response.status,
    );
  }

  return parsedPayload.data;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof RegisterRequestError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con la API. Verifica tu red e intenta nuevamente.";
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function useRegister() {
  const [state, setState] = useState<RegisterState>({
    error: null,
    isLoading: false,
    isSuccess: false,
  });

  const register = async (
    values: RegisterFormValues,
  ): Promise<RegisterResponse | null> => {
    setState({
      error: null,
      isLoading: true,
      isSuccess: false,
    });

    try {
      const result = await registerRequest(values);

      setState({
        error: null,
        isLoading: false,
        isSuccess: true,
      });

      return result;
    } catch (error) {
      setState({
        error: resolveErrorMessage(error),
        isLoading: false,
        isSuccess: false,
      });

      return null;
    }
  };

  return {
    register,
    ...state,
  };
}
