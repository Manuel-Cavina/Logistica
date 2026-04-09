/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import { useTransporterVehicles } from '../hooks/use-transporter-vehicles';
import VehicleFleetPage from './vehicle-fleet-page';

jest.mock('../hooks/use-transporter-vehicles', () => ({
  useTransporterVehicles: jest.fn(),
}));

jest.mock('../hooks/use-transporter-trailers', () => ({
  useTransporterTrailers: jest.fn(),
}));

const mockedUseTransporterVehicles = jest.mocked(useTransporterVehicles);
const mockedUseTransporterTrailers = jest.mocked(useTransporterTrailers);

describe('VehicleFleetPage', () => {
  beforeEach(() => {
    mockedUseTransporterVehicles.mockReset();
    mockedUseTransporterTrailers.mockReset();
  });

  it('renders the loading state for both fleet sections', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'loading',
      vehicles: [],
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
    expect(screen.getByText(/Cargando vehicles/i)).toBeInTheDocument();
    expect(screen.getByText(/Cargando trailers/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Registrar vehicle/i }),
    ).toHaveAttribute('href', '/vehicles/new');
  });

  it('renders the vehicles and trailers lists independently', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
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
    expect(screen.getByText('12 slot')).toBeInTheDocument();
    expect(screen.getByText(/Equino/i)).toBeInTheDocument();
  });
});
