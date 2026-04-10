/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDeactivateVehicle } from '../hooks/use-deactivate-vehicle';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import { useTransporterVehicles } from '../hooks/use-transporter-vehicles';
import VehicleFleetPage from './vehicle-fleet-page';

jest.mock('../hooks/use-deactivate-vehicle', () => ({
  useDeactivateVehicle: jest.fn(),
}));

jest.mock('../hooks/use-transporter-vehicles', () => ({
  useTransporterVehicles: jest.fn(),
}));

jest.mock('../hooks/use-transporter-trailers', () => ({
  useTransporterTrailers: jest.fn(),
}));

const mockedUseTransporterVehicles = jest.mocked(useTransporterVehicles);
const mockedUseTransporterTrailers = jest.mocked(useTransporterTrailers);
const mockedUseDeactivateVehicle = jest.mocked(useDeactivateVehicle);

describe('VehicleFleetPage', () => {
  beforeEach(() => {
    mockedUseTransporterVehicles.mockReset();
    mockedUseTransporterTrailers.mockReset();
    mockedUseDeactivateVehicle.mockReset();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it('renders the loading state for both fleet sections', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'loading',
      vehicles: [],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'loading',
      trailers: [],
    });

    render(<VehicleFleetPage />);

    expect(
      screen.getByRole('heading', {
        name: /Gestiona tu flota desde un solo lugar/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Estamos verificando si ya tenes la flota operativa minima/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cargando vehicles/i)).toBeInTheDocument();
    expect(screen.getByText(/Cargando trailers/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Registrar vehicle/i }),
    ).toHaveAttribute('href', '/vehicles/new');
    expect(
      screen.getByRole('link', { name: /Registrar trailer/i }),
    ).toHaveAttribute('href', '/trailers/new');
  });

  it('renders the vehicles and trailers lists independently', () => {
    const refetchVehicles = jest.fn();

    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: refetchVehicles,
      requestStatus: 'success',
      vehicles: [
        {
          brand: 'Scania',
          id: 'cmavhcl110000wqz5oy7k8v01',
          isActive: true,
          licensePlate: 'AA123BB',
          model: 'R450',
        },
      ],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle: jest.fn().mockResolvedValue({
        brand: 'Scania',
        id: 'cmavhcl110000wqz5oy7k8v01',
        isActive: false,
        licensePlate: 'AA123BB',
        model: 'R450',
      }),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      trailers: [
        {
          capacityUnit: 'SLOT',
          cargoType: 'EQUINE',
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: true,
          totalCapacity: 12,
        },
      ],
    });

    render(<VehicleFleetPage />);

    expect(screen.getByText('AA123BB')).toBeInTheDocument();
    expect(screen.getByText(/Scania R450/i)).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: /Editar/i })
        .some(
          (link) =>
            link.getAttribute('href') ===
            '/vehicles/cmavhcl110000wqz5oy7k8v01/edit',
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: /Editar/i })
        .some(
          (link) =>
            link.getAttribute('href') ===
            '/trailers/cmavhcl110000wqz5oy7k8v02/edit',
        ),
    ).toBe(true);
    expect(
      screen.getByRole('link', { name: /Registrar trailer/i }),
    ).toHaveAttribute('href', '/trailers/new');
    expect(
      screen.getByText(
        /Ya cumples con la flota operativa minima para la proxima etapa/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('12 slot')).toBeInTheDocument();
    expect(screen.getByText(/Equino/i)).toBeInTheDocument();
  });

  it('shows guidance when there are no trailers yet', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      vehicles: [],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      trailers: [],
    });

    render(<VehicleFleetPage />);

    expect(
      screen.getByText(
        /Todavia no registraste trailers. Para operar en la proxima etapa necesitas al menos uno activo./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /Registrar trailer/i })[0],
    ).toHaveAttribute('href', '/trailers/new');
  });

  it('warns when all loaded trailers are inactive', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      vehicles: [],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      trailers: [
        {
          capacityUnit: 'SLOT',
          cargoType: 'EQUINE',
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: false,
          totalCapacity: 12,
        },
      ],
    });

    render(<VehicleFleetPage />);

    expect(
      screen.getByText(/Tenes trailers cargados, pero ninguno esta activo./i),
    ).toBeInTheDocument();
  });

  it('shows an operational status error and retries the trailers query', async () => {
    const refetchTrailers = jest.fn();

    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      vehicles: [],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: 'No pudimos cargar los trailers.',
      refetch: refetchTrailers,
      requestStatus: 'error',
      trailers: [],
    });

    render(<VehicleFleetPage />);

    expect(
      screen.getByText(/No pudimos verificar tu estado operativo/i),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    const [retryButton] = screen.getAllByRole('button', {
      name: /Reintentar/i,
    });

    expect(retryButton).toBeDefined();

    await user.click(retryButton as HTMLElement);

    expect(refetchTrailers).toHaveBeenCalled();
  });

  it('deactivates a vehicle from the fleet list and refetches the section', async () => {
    const deactivateVehicle = jest.fn().mockResolvedValue({
      brand: 'Scania',
      id: 'cmavhcl110000wqz5oy7k8v01',
      isActive: false,
      licensePlate: 'AA123BB',
      model: 'R450',
    });
    const refetchVehicles = jest.fn().mockResolvedValue(undefined);

    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: refetchVehicles,
      requestStatus: 'success',
      vehicles: [
        {
          brand: 'Scania',
          id: 'cmavhcl110000wqz5oy7k8v01',
          isActive: true,
          licensePlate: 'AA123BB',
          model: 'R450',
        },
      ],
    });
    mockedUseDeactivateVehicle.mockReturnValue({
      deactivateVehicle,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'success',
      trailers: [],
    });

    render(<VehicleFleetPage />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Desactivar/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('AA123BB'),
    );
    expect(deactivateVehicle).toHaveBeenCalledWith('cmavhcl110000wqz5oy7k8v01');
    expect(refetchVehicles).toHaveBeenCalled();
  });
});
