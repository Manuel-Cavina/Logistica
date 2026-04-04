/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminUsersListPage } from "./admin-users-list-page";

const useAdminUsers = jest.fn();

jest.mock("../hooks/use-admin-users", () => ({
  useAdminUsers: () => useAdminUsers(),
}));

describe("AdminUsersListPage", () => {
  beforeEach(() => {
    useAdminUsers.mockReset();
  });

  it("shows the loading state while the mock list is being prepared", () => {
    useAdminUsers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "loading",
      users: [],
    });

    render(<AdminUsersListPage />);

    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();
  });

  it("shows the empty state when the mock list is empty", () => {
    useAdminUsers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      users: [],
    });

    render(<AdminUsersListPage />);

    expect(screen.getByText(/No encontramos usuarios/i)).toBeInTheDocument();
  });

  it("shows a recoverable error state", () => {
    const refetch = jest.fn();

    useAdminUsers.mockReturnValue({
      error: "No pudimos cargar el listado basico de usuarios. Vuelve a intentarlo.",
      refetch,
      requestStatus: "error",
      users: [],
    });

    render(<AdminUsersListPage />);

    expect(
      screen.getByText(
        "No pudimos cargar el listado basico de usuarios. Vuelve a intentarlo.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the basic users table", () => {
    useAdminUsers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      users: [
        {
          email: "laura.funes@example.com",
          id: "cm9adminus0000wqz5oy7k8ph1",
          name: "Laura Funes",
          role: "CLIENT",
        },
      ],
    });

    render(<AdminUsersListPage />);

    expect(screen.getByText("Laura Funes")).toBeInTheDocument();
    expect(screen.getByText("laura.funes@example.com")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });
});
