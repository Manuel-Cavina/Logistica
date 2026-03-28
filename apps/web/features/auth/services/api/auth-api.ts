import {
  LoginResponseSchema,
  MeResponseSchema,
  RefreshResponseSchema,
  RegisterResponseSchema,
} from "@logistica/shared";
import { ApiError, apiClient, buildApiUrl } from "@/src/lib/api";
import type {
  AuthAccountLike,
  AuthUser,
  LoginFormValues,
  LoginResponse,
  RefreshResponse,
  RegisterFormValues,
  RegisterResponse,
} from "../../types/auth.types";
import {
  LoginRequestError,
  RegisterRequestError,
} from "../../types/auth.types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../session/access-token-store";

type FetchLike = typeof fetch;

const DEFAULT_LOGIN_ERROR_MESSAGE =
  "No se pudo iniciar sesion. Intenta nuevamente en unos segundos.";
const DEFAULT_REGISTER_ERROR_MESSAGE =
  "No se pudo completar el registro. Intenta nuevamente en unos segundos.";
const INVALID_ME_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para auth/me.";
const INVALID_REFRESH_RESPONSE_MESSAGE =
  "La API respondio con un payload invalido para auth/refresh.";

function buildAuthorizationHeaders(
  accessToken: string | null,
): HeadersInit | undefined {
  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function loginRequest(
  values: LoginFormValues,
  fetchImplementation: FetchLike = fetch,
): Promise<LoginResponse> {
  const response = await fetchImplementation(buildApiUrl("/auth/login"), {
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
    throw new LoginRequestError("SERVER_ERROR", DEFAULT_LOGIN_ERROR_MESSAGE, response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new LoginRequestError(
      "INVALID_RESPONSE",
      "La API respondio con un formato invalido.",
      response.status,
    );
  }

  const parsedPayload = LoginResponseSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new LoginRequestError(
      "INVALID_RESPONSE",
      "La API respondio con un formato invalido.",
      response.status,
    );
  }

  return parsedPayload.data;
}

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
      DEFAULT_REGISTER_ERROR_MESSAGE,
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

export function toAuthUser(account: AuthAccountLike): AuthUser {
  return {
    id: account.id,
    email: account.email,
    role: account.role,
  };
}

export function isUnauthorizedApiError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function getMe(
  accessToken: string | null = getAccessToken(),
): Promise<AuthUser> {
  const response = await apiClient.get<unknown>("/auth/me", {
    cache: "no-store",
    headers: buildAuthorizationHeaders(accessToken),
  });
  const parsedResponse = MeResponseSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_ME_RESPONSE_MESSAGE);
  }

  return parsedResponse.data;
}

export async function refreshSession(): Promise<RefreshResponse> {
  const response = await apiClient.post<unknown>("/auth/refresh", {
    cache: "no-store",
  });
  const parsedResponse = RefreshResponseSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw new Error(INVALID_REFRESH_RESPONSE_MESSAGE);
  }

  setAccessToken(parsedResponse.data.accessToken);

  return parsedResponse.data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiClient.post<Record<string, never>>("/auth/logout", {
      cache: "no-store",
    });
  } finally {
    clearAccessToken();
  }
}
