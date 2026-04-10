/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import { useUpdateTrailer } from '../hooks/use-update-trailer';
import { TrailerEditPage } from './trailer-edit-page';

const push = jest.fn();
const updateTrailer = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock('../hooks/use-transporter-trailers', () => ({
  useTransporterTrailers: jest.fn(),
}));

jest.mock('../hooks/use-update-trailer', () => ({
  useUpdateTrailer: jest.fn(),
}));

const mockedUseTransporterTrailers = jest.mocked(useTransporterTrailers);
const mockedUseUpdateTrailer = jest.mocked(useUpdateTrailer);

describe('TrailerEditPage', () => {
  beforeEach(() => {
    push.mockReset();
    updateTrailer.mockReset();
    mockedUseTransporterTrailers.mockReset();
    mockedUseUpdateTrailer.mockReset();
  });

  it('renders the loading state while the trailer list is being resolved', () => {
    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: jest.fn(),
      requestStatus: 'loading',
      trailers: [],
    });
    mockedUseUpdateTrailer.mockReturnValue({
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
      updateTrailer,
    });

    render(<TrailerEditPage trailerId="cmavhcl110000wqz5oy7k8v02" />);

    expect(
      screen.getByRole('heading', {
        name: /Ajusta un trailer sin salir del flujo de flota/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cargando el trailer seleccionado para editar/i),
    ).toBeInTheDocument();
  });

  it('submits the edited trailer and returns to the fleet hub', async () => {
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
          totalCapacity: 6,
        },
      ],
    });
    mockedUseUpdateTrailer.mockImplementation((_trailerId, options = {}) => ({
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
      updateTrailer: jest.fn(async (values) => {
        updateTrailer(values);
        options.onSuccess?.({
          capacityUnit: 'M3' as const,
          cargoType: 'GENERAL_CARGO' as const,
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: true,
          totalCapacity: 8,
        });

        return {
          capacityUnit: 'M3' as const,
          cargoType: 'GENERAL_CARGO' as const,
          id: 'cmavhcl110000wqz5oy7k8v02',
          isActive: true,
          totalCapacity: 8,
        };
      }),
    }));

    render(<TrailerEditPage trailerId="cmavhcl110000wqz5oy7k8v02" />);

    const user = userEvent.setup();

    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Equino')).toBeInTheDocument();
    expect(screen.getByDisplayValue('slot')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Capacidad total/i));
    await user.type(screen.getByLabelText(/Capacidad total/i), '8');
    await user.selectOptions(screen.getByLabelText(/Rubro/i), 'GENERAL_CARGO');
    await user.selectOptions(screen.getByLabelText(/Unidad/i), 'M3');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(updateTrailer).toHaveBeenCalledWith({
      capacityUnit: 'M3',
      cargoType: 'GENERAL_CARGO',
      totalCapacity: 8,
    });
    expect(push).toHaveBeenCalledWith('/vehicles');
  });
});
