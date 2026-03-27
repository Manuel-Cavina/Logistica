"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AuthContextValue,
  AuthStatus,
  AuthUser,
  AuthenticatedSession,
} from "../types/auth.types";
import { bootstrapSessionState } from "../services/bootstrap-session";
import { clearAccessToken, setAccessToken } from "../services/access-token-store";
import { logout as logoutRequest } from "../services/auth-service";
import { executeLogout } from "../services/logout-flow";
import { AuthContext } from "./auth-context";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  isBootstrapped: boolean;
};

const initialAuthState: AuthState = {
  user: null,
  status: "loading",
  isBootstrapped: false,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const bootstrapStartedRef = useRef(false);
  const bootstrapInFlightRef = useRef<Promise<void> | null>(null);
  const latestBootstrapRef = useRef<() => Promise<void>>(async () => undefined);
  const sessionVersionRef = useRef(0);

  function applyAuthenticatedSession(
    session: AuthenticatedSession,
    options?: { incrementVersion?: boolean },
  ): void {
    if (options?.incrementVersion !== false) {
      sessionVersionRef.current += 1;
    }

    setAccessToken(session.accessToken);
    setState({
      user: session.user,
      status: "authenticated",
      isBootstrapped: true,
    });
  }

  function applyUnauthenticatedState(options?: { incrementVersion?: boolean }): void {
    if (options?.incrementVersion !== false) {
      sessionVersionRef.current += 1;
    }

    clearAccessToken();
    setState({
      user: null,
      status: "unauthenticated",
      isBootstrapped: true,
    });
  }

  async function bootstrapSession(): Promise<void> {
    if (bootstrapInFlightRef.current) {
      return bootstrapInFlightRef.current;
    }

    setState((currentState) =>
      currentState.isBootstrapped
        ? currentState
        : {
            ...currentState,
            status: "loading",
          },
    );

    const bootstrapVersion = sessionVersionRef.current;
    const bootstrapTask = (async () => {
      const nextSession = await bootstrapSessionState();

      if (sessionVersionRef.current !== bootstrapVersion) {
        return;
      }

      if (
        nextSession.status === "authenticated" &&
        nextSession.user &&
        nextSession.accessToken
      ) {
        applyAuthenticatedSession(
          {
            accessToken: nextSession.accessToken,
            user: nextSession.user,
          },
          { incrementVersion: false },
        );

        return;
      }

      applyUnauthenticatedState({ incrementVersion: false });
    })();

    bootstrapInFlightRef.current = bootstrapTask;

    try {
      await bootstrapTask;
    } finally {
      if (bootstrapInFlightRef.current === bootstrapTask) {
        bootstrapInFlightRef.current = null;
      }
    }
  }

  async function logout(): Promise<void> {
    await executeLogout(logoutRequest, applyUnauthenticatedState);
  }

  latestBootstrapRef.current = bootstrapSession;

  useEffect(() => {
    if (bootstrapStartedRef.current) {
      return;
    }

    bootstrapStartedRef.current = true;
    void latestBootstrapRef.current();
  }, []);

  const contextValue: AuthContextValue = {
    user: state.user,
    status: state.status,
    isBootstrapped: state.isBootstrapped,
    bootstrapSession,
    setAuthenticatedSession: (session: AuthenticatedSession) => {
      applyAuthenticatedSession(session);
    },
    clearSession: () => {
      applyUnauthenticatedState();
    },
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
