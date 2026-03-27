"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

const DEFAULT_REDIRECT_PATH = "/";
const DEFAULT_LOGOUT_ERROR_MESSAGE =
  "No se pudo completar el cierre de sesion. Intenta nuevamente.";

export type LogoutState = {
  error: string | null;
  isLoading: boolean;
};

type RunLogoutFlowOptions = {
  logout: () => Promise<void>;
  replace: (href: string) => void;
  setState: (state: LogoutState) => void;
  redirectTo?: string;
};

function resolveLogoutErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return DEFAULT_LOGOUT_ERROR_MESSAGE;
}

export async function runLogoutFlow({
  logout,
  replace,
  setState,
  redirectTo = DEFAULT_REDIRECT_PATH,
}: RunLogoutFlowOptions): Promise<void> {
  setState({
    error: null,
    isLoading: true,
  });

  try {
    await logout();
    setState({
      error: null,
      isLoading: false,
    });
    startTransition(() => {
      replace(redirectTo);
    });
  } catch (error) {
    setState({
      error: resolveLogoutErrorMessage(error),
      isLoading: false,
    });
  }
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();
  const [state, setState] = useState<LogoutState>({
    error: null,
    isLoading: false,
  });

  async function handleLogout(): Promise<void> {
    await runLogoutFlow({
      logout,
      replace: router.replace,
      setState,
    });
  }

  return {
    logout: handleLogout,
    ...state,
  };
}
