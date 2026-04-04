"use client";

import { useEffect, useState } from "react";
import { fetchAdminUsersMock } from "../services/admin-users-mock-api";
import type { AdminUserListItem } from "../types/admin-user.types";

type AdminUsersRequestStatus = "loading" | "success" | "error";

type UseAdminUsersResult = {
  error: string | null;
  refetch: () => void;
  requestStatus: AdminUsersRequestStatus;
  users: AdminUserListItem[];
};

type AdminUsersState = {
  error: string | null;
  requestStatus: AdminUsersRequestStatus;
  users: AdminUserListItem[];
};

const initialState: AdminUsersState = {
  error: null,
  requestStatus: "loading",
  users: [],
};

export function useAdminUsers(): UseAdminUsersResult {
  const [state, setState] = useState<AdminUsersState>(initialState);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    setState((currentState) => ({
      ...currentState,
      error: null,
      requestStatus: "loading",
    }));

    async function loadAdminUsers(): Promise<void> {
      try {
        const users = await fetchAdminUsersMock();

        if (isCancelled) {
          return;
        }

        setState({
          error: null,
          requestStatus: "success",
          users,
        });
      } catch {
        if (isCancelled) {
          return;
        }

        setState({
          error:
            "No pudimos cargar el listado basico de usuarios. Vuelve a intentarlo.",
          requestStatus: "error",
          users: [],
        });
      }
    }

    void loadAdminUsers();

    return () => {
      isCancelled = true;
    };
  }, [requestVersion]);

  return {
    error: state.error,
    refetch: () => {
      setRequestVersion((currentVersion) => currentVersion + 1);
    },
    requestStatus: state.requestStatus,
    users: state.users,
  };
}
