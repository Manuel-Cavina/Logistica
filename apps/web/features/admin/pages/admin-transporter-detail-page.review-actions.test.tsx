/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminTransporterDetailPage } from "./admin-transporter-detail-page";

const useAdminTransporterDetail = jest.fn();
const useUpdateAdminTransporterStatus = jest.fn();

jest.mock("../hooks/use-admin-transporter-detail", () => ({
  useAdminTransporterDetail: (transporterId: string) =>
    useAdminTransporterDetail(transporterId),
}));

jest.mock("../hooks/use-update-admin-transporter-status", () => ({
  useUpdateAdminTransporterStatus: (transporterId: string) =>
    useUpdateAdminTransporterStatus(transporterId),
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

describe("AdminTransporterDetailPage review actions", () => {
  beforeEach(() => {
    useAdminTransporterDetail.mockReset();
    useUpdateAdminTransporterStatus.mockReset();
  });

  it("renders review actions only for pending transporters", () => {
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
    useUpdateAdminTransporterStatus.mockReturnValue({
      error: null,
      isSubmitting: false,
      lastSubmittedStatus: null,
      resetFeedback: jest.fn(),
      submitStatus: jest.fn(),
      successMessage: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(screen.getByRole("button", { name: /Aprobar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rechazar perfil/i })).toBeInTheDocument();
  });

  it("submits the approved status and refreshes the detail", async () => {
    const refetch = jest.fn();
    const resetFeedback = jest.fn();
    const submitStatus = jest.fn().mockResolvedValue({
      bio: "Traslado de equinos con seguimiento en ruta.",
      businessName: "Transportes del Prado SRL",
      contactPhone: "1155550000",
      displayName: "Transportes del Prado",
      id: "cm9admintr0000wqz5oy7k8ph1",
      maxDetourKmDefault: 120,
      verificationStatus: "VERIFIED",
    });

    useAdminTransporterDetail.mockReturnValue({
      error: null,
      refetch,
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
    useUpdateAdminTransporterStatus.mockReturnValue({
      error: null,
      isSubmitting: false,
      lastSubmittedStatus: null,
      resetFeedback,
      submitStatus,
      successMessage: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    fireEvent.click(screen.getByRole("button", { name: /Aprobar perfil/i }));

    await waitFor(() => {
      expect(submitStatus).toHaveBeenCalledWith("VERIFIED");
    });

    expect(resetFeedback).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  it("shows mutation feedback from the review hook", () => {
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
    useUpdateAdminTransporterStatus.mockReturnValue({
      error: "El estado del perfil cambio o la transicion ya no es valida. Recarga el detalle y vuelve a revisar.",
      isSubmitting: false,
      lastSubmittedStatus: "REJECTED",
      resetFeedback: jest.fn(),
      submitStatus: jest.fn(),
      successMessage: null,
    });

    render(<AdminTransporterDetailPage transporterId="cm9admintr0000wqz5oy7k8ph1" />);

    expect(
      screen.getByText(
        "El estado del perfil cambio o la transicion ya no es valida. Recarga el detalle y vuelve a revisar.",
      ),
    ).toBeInTheDocument();
  });
});
