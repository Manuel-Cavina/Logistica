/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { TransporterOnboardingErrorView } from "./transporter-onboarding-error-view";
import { TransporterOnboardingLoadingView } from "./transporter-onboarding-loading-view";

describe("Transporter onboarding loading and error states", () => {
  it("shows the redesigned loading state", () => {
    render(<TransporterOnboardingLoadingView />);

    expect(
      screen.getByText(/Cargamos tu perfil para mostrarte la vista correcta/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Verificando/i)).toBeInTheDocument();
  });

  it("shows the redesigned error state and lets the user retry", () => {
    const onRetry = jest.fn();

    render(
      <TransporterOnboardingErrorView
        error="No se pudo leer el perfil."
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByText(/Reintentamos leer tu estado para no mostrarte una vista incorrecta/i),
    ).toBeInTheDocument();
    expect(screen.getByText("No se pudo leer el perfil.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
