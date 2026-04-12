import type { AuthSessionSnapshot } from "../../types/auth.types";
import { getMe, isUnauthorizedApiError, refreshSession } from "../api/auth-api";
import { clearAccessToken, getAccessToken } from "./access-token-store";
import { getAccessTokenRole } from "./access-token-role";

const UNAUTHENTICATED_SESSION: AuthSessionSnapshot = {
  accessToken: null,
  user: null,
  status: "unauthenticated",
};

async function refreshAuthenticatedSession(): Promise<AuthSessionSnapshot> {
  const refreshResult = await refreshSession();
  const user = await getMe(refreshResult.accessToken);

  return {
    accessToken: refreshResult.accessToken,
    user,
    status: "authenticated",
  };
}

export async function bootstrapSessionState(): Promise<AuthSessionSnapshot> {
  try {
    const currentAccessToken = getAccessToken();
    const user = await getMe(currentAccessToken);
    const tokenRole = getAccessTokenRole(currentAccessToken);

    if (tokenRole && tokenRole !== user.role) {
      return await refreshAuthenticatedSession();
    }

    return {
      accessToken: currentAccessToken,
      user,
      status: "authenticated",
    };
  } catch (error) {
    if (!isUnauthorizedApiError(error)) {
      clearAccessToken();
      return UNAUTHENTICATED_SESSION;
    }
  }

  try {
    return await refreshAuthenticatedSession();
  } catch {
    clearAccessToken();
    return UNAUTHENTICATED_SESSION;
  }
}
