/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTransporterVehicles } from '../hooks/use-transporter-vehicles';
import { useUpdateVehicle } from '../hooks/use-update-vehicle';
import { VehicleEditPage } from './vehicle-edit-page';

const push = jest.fn();
const updateVehicle = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock('../hooks/use-transporter-vehicles', () => ({
  useTransporterVehicles: jest.fn(),
}));

jest.mock('../hooks/use-update-vehicle', () => ({
  useUpdateVehicle: jest.fn(),
}));

const mockedUseTransporterVehicles = jest.mocked(useTransporterVehicles);
const mockedUseUpdateVehicle = jest.mocked(useUpdateVehicle);

describe('VehicleEditPage', () => {
  beforeEach(() => {
    push.mockReset();
    updateVehicle.mockReset();
    mockedUseTransporterVehicles.mockReset();
    mockedUseUpdateVehicle.mockReset();
  });

  it('renders the loading state while the vehicle list is being resolved', () => {
    mockedUseTransporterVehicles.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'loading',
      vehicles: [],
    });
    mockedUseUpdateVehicle.mockReturnValue({
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
      updateVehicle,
    });

    render(<VehicleEditPage vehicleId="cmavhcl110000wqz5oy7k8v01" />);

    expect(
      screen.getByRole('heading', {
        name: /Ajusta un vehicle sin salir del flujo de flota/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cargando el vehicle seleccionado para editar/i),
    ).toBeInTheDocument();
  });

  it('submits the edited vehicle and returns to the fleet hub', async () => {
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
    mockedUseUpdateVehicle.mockImplementation((_vehicleId, options = {}) => ({
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
      updateVehicle: jest.fn(async (values) => {
        updateVehicle(values);
        options.onSuccess?.({
          brand: 'Scania',
          id: 'cmavhcl110000wqz5oy7k8v01',
          isActive: true,
          licensePlate: 'AA123BB',
          model: 'R500',
        });

        return {
          brand: 'Scania',
          id: 'cmavhcl110000wqz5oy7k8v01',
          isActive: true,
          licensePlate: 'AA123BB',
          model: 'R500',
        };
      }),
    }));

    render(<VehicleEditPage vehicleId="cmavhcl110000wqz5oy7k8v01" />);

    const user = userEvent.setup();

    expect(screen.getByDisplayValue('AA123BB')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Scania')).toBeInTheDocument();
    expect(screen.getByDisplayValue('R450')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Modelo/i));
    await user.type(screen.getByLabelText(/Modelo/i), 'R500');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(updateVehicle).toHaveBeenCalledWith({
      brand: 'Scania',
      licensePlate: 'AA123BB',
      model: 'R500',
    });
    expect(push).toHaveBeenCalledWith('/vehicles');
  });
});
