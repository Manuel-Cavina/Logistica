import type { AuthSessionSnapshot } from "../types/auth.types";
import { clearAccessToken, getAccessToken } from "./access-token-store";
import { getMe, isUnauthorizedApiError, refreshSession } from "./auth-service";

const UNAUTHENTICATED_SESSION: AuthSessionSnapshot = {
  accessToken: null,
  user: null,
  status: "unauthenticated",
};

export async function bootstrapSessionState(): Promise<AuthSessionSnapshot> {
  try {
    const user = await getMe();

    return {
      accessToken: getAccessToken(),
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
    const refreshResult = await refreshSession();
    const user = await getMe(refreshResult.accessToken);

    return {
      accessToken: refreshResult.accessToken,
      user,
      status: "authenticated",
    };
  } catch {
    clearAccessToken();
    return UNAUTHENTICATED_SESSION;
  }
}
