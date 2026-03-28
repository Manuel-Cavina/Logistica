"use client";

import { useState } from "react";
import { registerRequest } from "@/features/auth/services/api/auth-api";
import type {
  RegisterFormValues,
  RegisterResponse,
  RegisterState,
} from "../types/auth.types";
import { RegisterRequestError } from "../types/auth.types";

const DEFAULT_ERROR_MESSAGE =
  "No se pudo completar el registro. Intenta nuevamente en unos segundos.";

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

export { registerRequest };
