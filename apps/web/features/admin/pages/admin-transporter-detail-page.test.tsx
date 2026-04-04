/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminTransporterDetailPage } from "./admin-transporter-detail-page";

const useAdminTransporterDetail = jest.fn();

jest.mock("../hooks/use-admin-transporter-detail", () => ({
  useAdminTransporterDetail: (transporterId: string) =>
    useAdminTransporterDetail(transporterId),
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

describe("AdminTransporterDetailPage", () => {
  beforeEach(() => {
    useAdminTransporterDetail.mockReset();
  });

  it("shows the loading state while the detail is being fetched", () => {
    useAdminTransporterDetail.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "loading",
      transporter: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(
      screen.getByText(/Cargando detalle del transportista/i),
    ).toBeInTheDocument();
  });

  it("shows the not-found state when the transporter does not exist", () => {
    useAdminTransporterDetail.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "not-found",
      transporter: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(
      screen.getByText(/No encontramos este transportista/i),
    ).toBeInTheDocument();
  });

  it("shows a recoverable error state", () => {
    const refetch = jest.fn();

    useAdminTransporterDetail.mockReturnValue({
      error: "No pudimos cargar el detalle del transportista.",
      refetch,
      requestStatus: "error",
      transporter: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(
      screen.getByText("No pudimos cargar el detalle del transportista."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the transporter detail review card", () => {
    useAdminTransporterDetail.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      transporter: {
        bio: "Traslado de equinos con seguimiento en ruta.",
        businessName: "Transportes del Prado SRL",
        contactPhone: "1155550000",
        displayName: "Transportes del Prado",
        id: "cm9admintr0000wqz5oy7k8ph1",
        maxDetourKmDefault: 120,
        verificationStatus: "PENDING",
      },
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(screen.getByText("Transportes del Prado")).toBeInTheDocument();
    expect(screen.getByText("Transportes del Prado SRL")).toBeInTheDocument();
    expect(screen.getByText("1155550000")).toBeInTheDocument();
    expect(screen.getByText("120 km")).toBeInTheDocument();
    expect(
      screen.getByText("Traslado de equinos con seguimiento en ruta."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al listado/i })).toHaveAttribute(
      "href",
      "/admin/transporters",
    );
  });
});
