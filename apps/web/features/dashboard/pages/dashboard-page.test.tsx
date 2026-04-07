/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DashboardPageView from "./dashboard-page";

jest.mock("../components/dashboard-navigation", () => ({
  DashboardNavigation: () => <div>Mock dashboard navigation</div>,
}));

jest.mock("@/features/auth/components/feedback/logout-button", () => ({
  LogoutButton: () => <button type="button">Mock logout</button>,
}));

describe("DashboardPageView", () => {
  it("renders the redesigned transporter dashboard summary", () => {
    render(<DashboardPageView />);

    expect(
      screen.getByRole("heading", { name: /Panel operativo del transportista/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Contrato E2/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock dashboard navigation/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mock logout/i })).toBeInTheDocument();
    expect(screen.queryByText(/Placeholder de dashboard/i)).not.toBeInTheDocument();
  });
});
