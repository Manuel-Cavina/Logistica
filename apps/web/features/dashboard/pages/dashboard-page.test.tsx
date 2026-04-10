/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPageView from './dashboard-page';

const mockedUseAuth = jest.fn();

jest.mock('../components/dashboard-navigation', () => ({
  DashboardNavigation: () => <div>Mock dashboard navigation</div>,
}));

jest.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => mockedUseAuth(),
}));

jest.mock('@/features/auth/components/feedback/logout-button', () => ({
  LogoutButton: () => <button type="button">Mock logout</button>,
}));

describe('DashboardPageView', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it('renders the redesigned transporter dashboard summary', () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'TRANSPORTER' },
    });

    render(<DashboardPageView />);

    expect(
      screen.getByRole('heading', {
        name: /Panel operativo del transportista/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estado del acceso/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock dashboard navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Flota y operacion/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Mock logout/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Placeholder de dashboard/i),
    ).not.toBeInTheDocument();
  });

  it('renders the admin dashboard summary', () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
    });

    render(<DashboardPageView />);

    expect(
      screen.getByRole('heading', {
        name: /Panel operativo de administracion/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rol activo/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios y supervision/i)).toBeInTheDocument();
    expect(
      screen.getByText(/rutas administrativas protegidas/i),
    ).toBeInTheDocument();
  });
});
