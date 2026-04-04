/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminTransportersListPage } from "./admin-transporters-list-page";

const useAdminTransporters = jest.fn();

jest.mock("../hooks/use-admin-transporters", () => ({
  useAdminTransporters: () => useAdminTransporters(),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("AdminTransportersListPage", () => {
  beforeEach(() => {
    useAdminTransporters.mockReset();
  });

  it("shows the loading state while the list is being fetched", () => {
    useAdminTransporters.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "loading",
      transporters: [],
    });

    render(<AdminTransportersListPage />);

    expect(screen.getByText(/Cargando transportistas/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no transporters", () => {
    useAdminTransporters.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      transporters: [],
    });

    render(<AdminTransportersListPage />);

    expect(screen.getByText(/No encontramos transportistas/i)).toBeInTheDocument();
  });

  it("shows a recoverable error state", () => {
    const refetch = jest.fn();

    useAdminTransporters.mockReturnValue({
      error: "No pudimos cargar el listado de transportistas.",
      refetch,
      requestStatus: "error",
      transporters: [],
    });

    render(<AdminTransportersListPage />);

    expect(
      screen.getByText("No pudimos cargar el listado de transportistas."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the transporters table with detail links", () => {
    useAdminTransporters.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      transporters: [
        {
          contactPhone: "1155550000",
          displayName: "Transportes del Prado",
          id: "cm9admintr0000wqz5oy7k8ph1",
          verificationStatus: "PENDING",
        },
      ],
    });

    render(<AdminTransportersListPage />);

    expect(screen.getByText("Transportes del Prado")).toBeInTheDocument();
    expect(screen.getByText("1155550000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver detalle/i })).toHaveAttribute(
      "href",
      "/admin/transporters/cm9admintr0000wqz5oy7k8ph1",
    );
  });
});
