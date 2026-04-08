/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCreateVehicle } from "../hooks/use-create-vehicle";
import type { Vehicle, VehicleFormValues } from "../types/vehicle.types";
import { VehicleForm } from "./vehicle-form";

jest.mock("../hooks/use-create-vehicle", () => ({
  useCreateVehicle: jest.fn(),
}));

const mockedUseCreateVehicle = jest.mocked(useCreateVehicle);
type CreateVehicleMock = (values: VehicleFormValues) => Promise<Vehicle | null>;

describe("VehicleForm", () => {
  beforeEach(() => {
    mockedUseCreateVehicle.mockReset();
  });

  it("shows client validation feedback and keeps submit disabled for invalid values", async () => {
    const createVehicle: jest.MockedFunction<CreateVehicleMock> = jest.fn(
      async (_values: VehicleFormValues) => null,
    );

    mockedUseCreateVehicle.mockReturnValue({
      createVehicle,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<VehicleForm />);

    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: /Registrar vehicle/i });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Patente"), "123");
    await user.type(screen.getByLabelText("Marca"), "Scania");
    await user.type(screen.getByLabelText("Modelo"), "R450");

    await waitFor(() => {
      expect(screen.getByText("Ingresa una patente valida.")).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it("submits valid values and shows the created vehicle feedback", async () => {
    const createVehicle: jest.MockedFunction<CreateVehicleMock> = jest.fn(
      async (_values: VehicleFormValues) => ({
        brand: "Scania",
        id: "cmavhcl110000wqz5oy7k8v01",
        isActive: true,
        licensePlate: "AA123BB",
        model: "R450",
      }),
    );

    mockedUseCreateVehicle.mockReturnValue({
      createVehicle,
      isSubmitting: false,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<VehicleForm />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Patente"), "aa123bb");
    await user.type(screen.getByLabelText("Marca"), "Scania");
    await user.type(screen.getByLabelText("Modelo"), "R450");

    await user.click(screen.getByRole("button", { name: /Registrar vehicle/i }));

    await waitFor(() => {
      expect(createVehicle).toHaveBeenCalledWith({
        brand: "Scania",
        licensePlate: "AA123BB",
        model: "R450",
      });
    });

    expect(
      await screen.findByText(/Vehicle registrado correctamente: AA123BB - Scania R450./i),
    ).toBeInTheDocument();
  });

  it("shows loading feedback while the request is in flight", async () => {
    const createVehicle: jest.MockedFunction<CreateVehicleMock> = jest.fn(
      async (_values: VehicleFormValues) => null,
    );

    mockedUseCreateVehicle.mockReturnValue({
      createVehicle,
      isSubmitting: true,
      resetSubmitError: jest.fn(),
      submitError: null,
    });

    render(<VehicleForm />);

    expect(screen.getByRole("button", { name: /Registrando/i })).toBeDisabled();
  });
});
