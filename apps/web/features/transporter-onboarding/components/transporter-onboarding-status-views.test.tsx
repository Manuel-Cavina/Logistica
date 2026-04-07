/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TransporterOnboardingIncompleteView } from "./transporter-onboarding-incomplete-view";
import { TransporterOnboardingPendingView } from "./transporter-onboarding-pending-view";
import { TransporterOnboardingRejectedView } from "./transporter-onboarding-rejected-view";
import type { TransporterProfile } from "../types/transporter-profile.types";

function buildProfile(
  verificationStatus: TransporterProfile["verificationStatus"],
): TransporterProfile {
  return {
    bio: "Traslados coordinados para equinos deportivos.",
    businessName: "Transportes del Prado",
    contactPhone: "1155550000",
    displayName: "Transportes del Prado",
    maxDetourKmDefault: 120,
    verificationStatus,
  };
}

describe("Transporter onboarding status views", () => {
  const onSuccess = jest.fn();

  it("shows the redesigned incomplete onboarding with the form placeholder", () => {
    render(
      <TransporterOnboardingIncompleteView
        onSuccess={onSuccess}
        profile={buildProfile("INCOMPLETE")}
      />,
    );

    expect(
      screen.getByText(/Ruta de activacion/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Completar perfil/i }),
    ).toHaveAttribute("href", "#profile-form");
    expect(
      screen.getByText(/Edita tu perfil de transportista/i),
    ).toBeInTheDocument();
  });

  it("shows the redesigned pending onboarding without CTA", () => {
    render(<TransporterOnboardingPendingView profile={buildProfile("PENDING")} />);

    expect(
      screen.getByText(/Tu perfil ya entro en revision manual/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the redesigned rejected onboarding without inventing reasons", () => {
    render(
      <TransporterOnboardingRejectedView
        onSuccess={onSuccess}
        profile={buildProfile("REJECTED")}
      />,
    );

    expect(
      screen.getByText(/Corregi lo necesario y vuelve a enviar/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Revisar datos del perfil/i }),
    ).toHaveAttribute("href", "#profile-form");
    expect(screen.queryByText(/motivo/i)).not.toBeInTheDocument();
  });
});
