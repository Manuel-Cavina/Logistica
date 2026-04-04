/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TransporterProfileGuard } from "./transporter-profile-guard";

const replace = jest.fn();
const useAuth = jest.fn();
const useTransporterGuardProfile = jest.fn();
let currentPathname = "/dashboard";

jest.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    replace,
  }),
}));

jest.mock("../../hooks/use-auth", () => ({
  useAuth: () => useAuth(),
}));

jest.mock("../../hooks/use-transporter-guard-profile", () => ({
  useTransporterGuardProfile: (input: { enabled: boolean }) =>
    useTransporterGuardProfile(input),
}));

describe("TransporterProfileGuard", () => {
  beforeEach(() => {
    currentPathname = "/dashboard";
    replace.mockReset();
    useAuth.mockReset();
    useTransporterGuardProfile.mockReset();
  });

  it("renders protected content for non-transporter roles without loading the transporter profile", () => {
    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "client-1",
        role: "CLIENT",
      },
    });

    render(
      <TransporterProfileGuard>
        <div>Dashboard content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(useTransporterGuardProfile).toHaveBeenCalledWith({ enabled: false });
    expect(replace).not.toHaveBeenCalled();
  });

  it("holds the protected content while the transporter profile is loading", () => {
    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "transporter-1",
        role: "TRANSPORTER",
      },
    });
    useTransporterGuardProfile.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "loading",
      verificationStatus: null,
    });

    render(
      <TransporterProfileGuard>
        <div>Dashboard content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
    expect(screen.getByText(/Validando acceso/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects incomplete transporters to onboarding", async () => {
    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "transporter-1",
        role: "TRANSPORTER",
      },
    });
    useTransporterGuardProfile.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      verificationStatus: "INCOMPLETE",
    });

    render(
      <TransporterProfileGuard>
        <div>Dashboard content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/onboarding/transporter");
    });
  });

  it("does not redirect when the transporter is already inside onboarding", () => {
    currentPathname = "/onboarding/transporter";
    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "transporter-1",
        role: "TRANSPORTER",
      },
    });
    useTransporterGuardProfile.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      verificationStatus: "INCOMPLETE",
    });

    render(
      <TransporterProfileGuard>
        <div>Onboarding content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.getByText("Onboarding content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders protected content when the transporter is pending", () => {
    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "transporter-1",
        role: "TRANSPORTER",
      },
    });
    useTransporterGuardProfile.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: "success",
      verificationStatus: "PENDING",
    });

    render(
      <TransporterProfileGuard>
        <div>Dashboard content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a recoverable error state and retries the profile request", () => {
    const refetch = jest.fn();

    useAuth.mockReturnValue({
      status: "authenticated",
      user: {
        id: "transporter-1",
        role: "TRANSPORTER",
      },
    });
    useTransporterGuardProfile.mockReturnValue({
      error: "No pudimos validar tu perfil de transportista.",
      refetch,
      requestStatus: "error",
      verificationStatus: null,
    });

    render(
      <TransporterProfileGuard>
        <div>Dashboard content</div>
      </TransporterProfileGuard>,
    );

    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument();
    expect(
      screen.getByText("No pudimos validar tu perfil de transportista."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
