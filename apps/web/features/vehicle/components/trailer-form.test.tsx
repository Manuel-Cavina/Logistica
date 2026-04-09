/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCreateTrailer } from '../hooks/use-create-trailer';
import type { Trailer, TrailerFormValues } from '../types/trailer.types';
import { TrailerForm } from './trailer-form';

jest.mock('../hooks/use-create-trailer', () => ({
  useCreateTrailer: jest.fn(),
}));

const mockedUseCreateTrailer = jest.mocked(useCreateTrailer);
type CreateTrailerMock = (values: TrailerFormValues) => Promise<Trailer | null>;

describe('TrailerForm', () => {
  beforeEach(() => {
    mockedUseCreateTrailer.mockReset();
  });

  it('shows client validation feedback and keeps submit disabled for invalid values', async () => {
    const createTrailer: jest.MockedFunction<CreateTrailerMock> = jest.fn(
      async (_values: TrailerFormValues) => null,
    );

    mockedUseCreateTrailer.mockReturnValue({
      createTrailer,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<TrailerForm />);

    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', {
      name: /Registrar trailer/i,
    });

    expect(submitButton).toBeDisabled();

    await user.clear(screen.getByLabelText('Capacidad total'));
    await user.type(screen.getByLabelText('Capacidad total'), '0');

    await waitFor(() => {
      expect(
        screen.getByText('La capacidad total debe ser mayor a cero.'),
      ).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(createTrailer).not.toHaveBeenCalled();
  });

  it('submits valid values with MVP defaults and shows the created trailer feedback', async () => {
    const createTrailer: jest.MockedFunction<CreateTrailerMock> = jest.fn(
      async (_values: TrailerFormValues) => ({
        capacityUnit: 'SLOT' as const,
        cargoType: 'EQUINE' as const,
        id: 'cmavhcl110000wqz5oy7k8v02',
        isActive: true,
        totalCapacity: 6,
      }),
    );

    mockedUseCreateTrailer.mockReturnValue({
      createTrailer,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<TrailerForm />);

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Capacidad total'));
    await user.type(screen.getByLabelText('Capacidad total'), '6');

    await user.click(
      screen.getByRole('button', { name: /Registrar trailer/i }),
    );

    await waitFor(() => {
      expect(createTrailer).toHaveBeenCalledWith({
        capacityUnit: 'SLOT',
        cargoType: 'EQUINE',
        totalCapacity: 6,
      });
    });

    expect(
      await screen.findByText(
        /Trailer registrado correctamente: 6 slot para Equino./i,
      ),
    ).toBeInTheDocument();
  });

  it('shows loading feedback while the request is in flight', () => {
    const createTrailer: jest.MockedFunction<CreateTrailerMock> = jest.fn(
      async (_values: TrailerFormValues) => null,
    );

    mockedUseCreateTrailer.mockReturnValue({
      createTrailer,
      isSubmitting: true,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<TrailerForm />);

    expect(screen.getByRole('button', { name: /Registrando/i })).toBeDisabled();
  });
});
