/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDeactivateTrailer } from '../hooks/use-deactivate-trailer';
import { useTransporterTrailers } from '../hooks/use-transporter-trailers';
import { TrailerFleetSection } from './trailer-fleet-section';

jest.mock('../hooks/use-deactivate-trailer', () => ({
  useDeactivateTrailer: jest.fn(),
}));

jest.mock('../hooks/use-transporter-trailers', () => ({
  useTransporterTrailers: jest.fn(),
}));

const mockedUseTransporterTrailers = jest.mocked(useTransporterTrailers);
const mockedUseDeactivateTrailer = jest.mocked(useDeactivateTrailer);

describe('TrailerFleetSection', () => {
  beforeEach(() => {
    mockedUseTransporterTrailers.mockReset();
    mockedUseDeactivateTrailer.mockReset();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it('renders trailer actions in the fleet list', () => {
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
    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer: jest.fn(),
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<TrailerFleetSection />);

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

    mockedUseTransporterTrailers.mockReturnValue({
      error: null,
      refetch: refetchTrailers,
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
    mockedUseDeactivateTrailer.mockReturnValue({
      deactivateTrailer,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<TrailerFleetSection />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Desactivar/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('6 slot'),
    );
    expect(deactivateTrailer).toHaveBeenCalledWith('cmavhcl110000wqz5oy7k8v02');
    expect(refetchTrailers).toHaveBeenCalled();
  });
});
