import { ConflictException, NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  const vehicleRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    findByLicensePlate: jest.fn(),
    create: jest.fn(),
  };

  let vehicleService: VehicleService;

  beforeEach(() => {
    jest.clearAllMocks();
    vehicleService = new VehicleService(vehicleRepository as never);
  });

  it('creates a vehicle for the authenticated transporter', async () => {
    vehicleRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    vehicleRepository.findByLicensePlate.mockResolvedValue(null);
    vehicleRepository.create.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });

    await expect(
      vehicleService.createOwnVehicle('account-id', {
        licensePlate: 'ab123cd',
        brand: '  Scania  ',
        model: '  R450 ',
      }),
    ).resolves.toEqual({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });

    expect(vehicleRepository.findTransporterProfileByAccountId).toHaveBeenCalledWith(
      'account-id',
    );
    expect(vehicleRepository.findByLicensePlate).toHaveBeenCalledWith('AB123CD');
    expect(vehicleRepository.create).toHaveBeenCalledWith('transporter-profile-id', {
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
    });
  });

  it('throws when the authenticated account has no transporter profile', async () => {
    vehicleRepository.findTransporterProfileByAccountId.mockResolvedValue(null);

    await expect(
      vehicleService.createOwnVehicle('missing-account', {
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(vehicleRepository.findByLicensePlate).not.toHaveBeenCalled();
    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });

  it('throws when the license plate already exists', async () => {
    vehicleRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    vehicleRepository.findByLicensePlate.mockResolvedValue({
      id: 'existing-vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Volvo',
      model: 'FH',
      isActive: true,
    });

    await expect(
      vehicleService.createOwnVehicle('account-id', {
        licensePlate: 'ab123cd',
        brand: 'Scania',
        model: 'R450',
      }),
    ).rejects.toThrow(ConflictException);

    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });
});
