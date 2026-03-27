"use client";

import { LoginResponseSchema } from "@logistica/shared";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toAuthUser } from "@/features/auth/services/auth-service";
import type {
  LoginFormValues,
  LoginResponse,
  LoginState,
} from "../types/auth.types";
import { LoginRequestError } from "../types/auth.types";

type FetchLike = typeof fetch;

const DEFAULT_ERROR_MESSAGE =
  "No se pudo iniciar sesión. Intentá nuevamente en unos segundos.";

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new LoginRequestError(
      "CONFIGURATION_ERROR",
      "Falta configurar NEXT_PUBLIC_API_URL para conectar con la API.",
    );
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function buildLoginEndpoint(apiBaseUrl: string): string {
  return `${apiBaseUrl}/auth/login`;
}

export async function loginRequest(
  values: LoginFormValues,
  fetchImplementation: FetchLike = fetch,
): Promise<LoginResponse> {
  const response = await fetchImplementation(buildLoginEndpoint(getApiBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(values),
  });

  if (response.status === 401) {
    throw new LoginRequestError(
      "INVALID_CREDENTIALS",
      "Credenciales inválidas",
      response.status,
    );
  }

  if (!response.ok) {
    throw new LoginRequestError("SERVER_ERROR", DEFAULT_ERROR_MESSAGE, response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new LoginRequestError(
      "INVALID_RESPONSE",
      "La API respondió con un formato inválido.",
      response.status,
    );
  }

  const parsedPayload = LoginResponseSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new LoginRequestError(
      "INVALID_RESPONSE",
      "La API respondió con un formato inválido.",
      response.status,
    );
  }

  return parsedPayload.data;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof LoginRequestError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con la API. Verificá tu red e intentá nuevamente.";
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function useLogin() {
  const router = useRouter();
  const { setAuthenticatedSession } = useAuth();
  const [state, setState] = useState<LoginState>({
    error: null,
    isLoading: false,
    isSuccess: false,
  });

  const login = async (values: LoginFormValues): Promise<LoginResponse | null> => {
    setState({
      error: null,
      isLoading: true,
      isSuccess: false,
    });

    try {
      const result = await loginRequest(values);
      setAuthenticatedSession({
        accessToken: result.accessToken,
        user: toAuthUser(result.account),
      });

      setState({
        error: null,
        isLoading: false,
        isSuccess: true,
      });

      startTransition(() => {
        router.push("/dashboard");
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
    login,
    ...state,
  };
}
