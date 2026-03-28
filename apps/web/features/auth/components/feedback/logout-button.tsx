"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "../../hooks/use-logout";

export function LogoutButton() {
  const { error, isLoading, logout } = useLogout();

  return (
    <div className="mt-8 space-y-3">
      <Button
        className="w-full sm:w-auto"
        isLoading={isLoading}
        loadingText="Cerrando sesion"
        onClick={() => {
          void logout();
        }}
        type="button"
        variant="ghost"
      >
        Cerrar sesion
      </Button>

      {error ? (
        <p className="text-sm leading-6 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
