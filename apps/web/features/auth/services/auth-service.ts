import { MeResponseSchema, RefreshResponseSchema } from "@logistica/shared";
import { ApiError, apiClient } from "@/lib/api";
import type {
  AuthAccountLike,
  AuthUser,
  RefreshResponse,
} from "../types/auth.types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./access-token-store";

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

export async function logout(): Promise<void> {
  try {
    await apiClient.post<Record<string, never>>("/auth/logout", {
      cache: "no-store",
    });
  } finally {
    clearAccessToken();
  }
}
