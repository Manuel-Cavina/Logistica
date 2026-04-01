/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TransporterVerificationBadge } from "./transporter-verification-badge";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";

describe("TransporterVerificationBadge", () => {
  it("renders the user-facing label for the backend status", () => {
    render(<TransporterVerificationBadge status="PENDING" />);

    expect(screen.getByText("En revision")).toBeInTheDocument();
    expect(screen.queryByText("verificationStatus")).not.toBeInTheDocument();
  });
});

describe("TransporterVerificationSummaryCard", () => {
  it("renders the configured description and CTA for incomplete profiles", () => {
    render(<TransporterVerificationSummaryCard status="INCOMPLETE" />);

    expect(
      screen.getByText(/Completa tu perfil para avanzar con la verificacion/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Completar perfil/i }),
    ).toHaveAttribute("href", "#profile-form");
  });

  it("hides the CTA for pending profiles", () => {
    render(<TransporterVerificationSummaryCard status="PENDING" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/nuestro equipo la esta revisando/i)).toBeInTheDocument();
  });

  it("does not invent a rejection reason", () => {
    render(<TransporterVerificationSummaryCard status="REJECTED" />);

    expect(
      screen.getByText(/tu perfil necesita correcciones antes de volver a revision/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/motivo/i)).not.toBeInTheDocument();
  });

  it("renders verified status without exposing technical values or actions", () => {
    render(<TransporterVerificationSummaryCard status="VERIFIED" />);

    expect(screen.getByText("Verificado")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("VERIFIED")).not.toBeInTheDocument();
  });
});
