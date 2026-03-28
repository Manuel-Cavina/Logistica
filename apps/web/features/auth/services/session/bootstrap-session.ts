import type { AuthSessionSnapshot } from "../../types/auth.types";
import { getMe, isUnauthorizedApiError, refreshSession } from "../api/auth-api";
import { clearAccessToken, getAccessToken } from "./access-token-store";

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
