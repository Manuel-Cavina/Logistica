/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TrailerCreatePage from './trailer-create-page';

describe('TrailerCreatePage', () => {
  it('renders the trailer create content and the return CTA', () => {
    render(<TrailerCreatePage />);

    expect(
      screen.getByRole('heading', {
        name: /Declara la capacidad operativa de tu trailer/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rubro: Equino. Unidad: slot./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Volver a la flota/i }),
    ).toHaveAttribute('href', '/vehicles');
  });
});
