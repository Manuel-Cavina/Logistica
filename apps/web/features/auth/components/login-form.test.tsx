/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLogin } from "@/features/auth/hooks/use-login";
import { LoginForm } from "./login-form";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href }, children),
}));

jest.mock("@/features/auth/hooks/use-login", () => ({
  useLogin: jest.fn(),
}));

const mockedUseLogin = jest.mocked(useLogin);

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

describe("LoginForm", () => {
  beforeEach(() => {
    mockedUseLogin.mockReset();
  });

  it("shows field errors in the client and keeps submit disabled for invalid values", async () => {
    const login = jest.fn(async () => null);

    mockedUseLogin.mockReturnValue({
      error: null,
      isLoading: false,
      isSuccess: false,
      login,
    });

    render(<LoginForm />);

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Iniciar sesion" });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.type(screen.getByLabelText("Contrasena"), "12345");

    await waitFor(() => {
      expect(screen.getByText("Ingresa un email valido.")).toBeInTheDocument();
    });

    expect(
      screen.getByText("La contrasena debe tener al menos 6 caracteres."),
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(login).not.toHaveBeenCalled();
  });

  it("shows loading feedback and prevents double submit for valid credentials", async () => {
    const deferred = createDeferred<null>();
    const login = jest.fn(() => deferred.promise);

    mockedUseLogin.mockReturnValue({
      error: null,
      isLoading: false,
      isSuccess: false,
      login,
    });

    render(<LoginForm />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Email"), "client@example.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret1");

    const submitButton = screen.getByRole("button", { name: "Iniciar sesion" });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    const form = submitButton.closest("form");

    expect(form).not.toBeNull();

    await act(async () => {
      fireEvent.submit(form as HTMLFormElement);
      fireEvent.submit(form as HTMLFormElement);
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledTimes(1);
    });

    expect(login).toHaveBeenCalledWith({
      email: "client@example.com",
      password: "secret1",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ingresando" })).toBeDisabled();
    });

    await act(async () => {
      deferred.resolve(null);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Iniciar sesion" })).toBeEnabled();
    });
  });
});
