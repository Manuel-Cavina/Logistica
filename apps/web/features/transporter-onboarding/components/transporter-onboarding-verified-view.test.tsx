/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TransporterOnboardingVerifiedView } from "./transporter-onboarding-verified-view";
import type { TransporterProfile } from "../types/transporter-profile.types";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

function buildProfile(): TransporterProfile {
  return {
    bio: "Traslados coordinados para equinos deportivos.",
    businessName: "Transportes del Prado",
    contactPhone: "1155550000",
    displayName: "Transportes del Prado",
    maxDetourKmDefault: 120,
    verificationStatus: "VERIFIED",
  };
}

describe("TransporterOnboardingVerifiedView", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    replace.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows the verified confirmation and redirects to the dashboard after the delay", () => {
    render(
      <TransporterOnboardingVerifiedView
        profile={buildProfile()}
        redirectDelayMs={1200}
      />,
    );

    expect(
      screen.getByText(/Ya podes continuar al dashboard cuando termine la confirmacion/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Verificacion completada con exito/i)).toBeInTheDocument();
    expect(screen.getByText(/Te llevamos al dashboard en unos segundos/i)).toBeInTheDocument();

    expect(replace).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1200);

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
