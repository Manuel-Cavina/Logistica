/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDeactivateTrailer } from '../hooks/use-deactivate-trailer';
import { TrailerFleetSection } from './trailer-fleet-section';

jest.mock('../hooks/use-deactivate-trailer', () => ({
  useDeactivateTrailer: jest.fn(),
}));

const mockedUseDeactivateTrailer = jest.mocked(useDeactivateTrailer);

describe('TrailerFleetSection', () => {
  beforeEach(() => {
    mockedUseDeactivateTrailer.mockReset();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it('renders trailer actions in the fleet list', () => {
    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(
      <TrailerFleetSection
        error={null}
        onRetry={jest.fn()}
        requestStatus="success"
        trailers={[
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v02',
            isActive: true,
            totalCapacity: 6,
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Editar/i })).toHaveAttribute(
      'href',
      '/trailers/cmavhcl110000wqz5oy7k8v02/edit',
    );
    expect(
      screen.getByRole('button', { name: /Desactivar/i }),
    ).toBeInTheDocument();
  });

  it('deactivates a trailer from the fleet section and refetches the list', async () => {
    const deactivateTrailer = jest.fn().mockResolvedValue({
      capacityUnit: 'SLOT',
      cargoType: 'EQUINE',
      id: 'cmavhcl110000wqz5oy7k8v02',
      isActive: false,
      totalCapacity: 6,
    });
    const refetchTrailers = jest.fn().mockResolvedValue(undefined);

    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(
      <TrailerFleetSection
        error={null}
        onRetry={refetchTrailers}
        requestStatus="success"
        trailers={[
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v02',
            isActive: true,
            totalCapacity: 6,
          },
        ]}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Desactivar/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('6 slot'),
    );
    expect(deactivateTrailer).toHaveBeenCalledWith('cmavhcl110000wqz5oy7k8v02');
    expect(refetchTrailers).toHaveBeenCalled();
  });

  it('disables every deactivate action while one request is in flight', () => {
    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer: jest.fn(),
      isSubmitting: true,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(
      <TrailerFleetSection
        error={null}
        onRetry={jest.fn()}
        requestStatus="success"
        trailers={[
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v02',
            isActive: true,
            totalCapacity: 6,
          },
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v03',
            isActive: true,
            totalCapacity: 8,
          },
        ]}
      />,
    );

    const deactivateButtons = screen.getAllByRole('button', {
      name: /Desactivar/i,
    });

    expect(deactivateButtons).toHaveLength(2);
    expect(deactivateButtons[0]).toBeDisabled();
    expect(deactivateButtons[1]).toBeDisabled();
  });

  it('shows active and inactive trailer states with distinct labels', () => {
    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(
      <TrailerFleetSection
        error={null}
        onRetry={jest.fn()}
        requestStatus="success"
        trailers={[
          {
            capacityUnit: 'SLOT',
            cargoType: 'EQUINE',
            id: 'cmavhcl110000wqz5oy7k8v02',
            isActive: true,
            totalCapacity: 6,
          },
          {
            capacityUnit: 'SLOT',
            cargoType: 'GENERAL_CARGO',
            id: 'cmavhcl110000wqz5oy7k8v03',
            isActive: false,
            totalCapacity: 8,
          },
        ]}
      />,
    );

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('8 slot')).toBeInTheDocument();
    expect(screen.getByText(/Carga general/i)).toBeInTheDocument();
  });
});
