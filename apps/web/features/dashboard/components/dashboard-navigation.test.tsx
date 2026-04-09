/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardNavigation } from './dashboard-navigation';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

describe('DashboardNavigation', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('navigates to the dashboard route', async () => {
    render(<DashboardNavigation />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: /Ver panel del transportista/i }),
    );

    expect(push).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to the transporter onboarding route', async () => {
    render(<DashboardNavigation />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Abrir onboarding/i }));

    expect(push).toHaveBeenCalledWith('/onboarding/transporter');
  });

  it('navigates to the fleet hub route', async () => {
    render(<DashboardNavigation />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Gestionar flota/i }));

    expect(push).toHaveBeenCalledWith('/vehicles');
  });

  it('navigates to the vehicle creation route', async () => {
    render(<DashboardNavigation />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: /Registrar vehicle/i }),
    );

    expect(push).toHaveBeenCalledWith('/vehicles/new');
  });
});
