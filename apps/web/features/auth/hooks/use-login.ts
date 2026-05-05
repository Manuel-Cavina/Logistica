"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  loginRequest,
  toAuthUser,
} from "@/features/auth/services/api/auth-api";
import { getDefaultAuthorizedPath } from "@/features/auth/services/authorization";
import type {
  LoginFormValues,
  LoginResponse,
  LoginState,
} from "../types/auth.types";
import { LoginRequestError } from "../types/auth.types";

const DEFAULT_ERROR_MESSAGE =
  "No se pudo iniciar sesion. Intenta nuevamente en unos segundos.";

function resolveErrorMessage(error: unknown): string {
  if (error instanceof LoginRequestError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con la API. Verifica tu red e intenta nuevamente.";
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
        router.push(getDefaultAuthorizedPath(result.account.role));
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

export { loginRequest };
