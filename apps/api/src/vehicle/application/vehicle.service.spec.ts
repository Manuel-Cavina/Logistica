import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@logistica/database';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  const vehicleRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    findByLicensePlate: jest.fn(),
    findOwnedById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
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

    expect(
      vehicleRepository.findTransporterProfileByAccountId,
    ).toHaveBeenCalledWith('account-id');
    expect(vehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
      'AB123CD',
    );
    expect(vehicleRepository.create).toHaveBeenCalledWith(
      'transporter-profile-id',
      {
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
      },
    );
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

  it('throws conflict when create fails with a unique constraint race', async () => {
    vehicleRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    vehicleRepository.findByLicensePlate.mockResolvedValue(null);
    vehicleRepository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed.', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      vehicleService.createOwnVehicle('account-id', {
        licensePlate: 'ab123cd',
        brand: 'Scania',
        model: 'R450',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('updates an owned vehicle', async () => {
    vehicleRepository.findOwnedById.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });
    vehicleRepository.updateById.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Mercedes',
      model: 'Actros',
      isActive: true,
    });

    await expect(
      vehicleService.updateOwnVehicle('account-id', 'vehicle-id', {
        brand: ' Mercedes ',
        model: ' Actros ',
      }),
    ).resolves.toEqual({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Mercedes',
      model: 'Actros',
      isActive: true,
    });

    expect(vehicleRepository.findOwnedById).toHaveBeenCalledWith(
      'account-id',
      'vehicle-id',
    );
    expect(vehicleRepository.findByLicensePlate).not.toHaveBeenCalled();
    expect(vehicleRepository.updateById).toHaveBeenCalledWith('vehicle-id', {
      brand: 'Mercedes',
      model: 'Actros',
    });
  });

  it('throws when updating a vehicle that is not owned by the account', async () => {
    vehicleRepository.findOwnedById.mockResolvedValue(null);

    await expect(
      vehicleService.updateOwnVehicle('account-id', 'vehicle-id', {
        brand: 'Mercedes',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(vehicleRepository.updateById).not.toHaveBeenCalled();
  });

  it('throws conflict when updating to a duplicated license plate', async () => {
    vehicleRepository.findOwnedById.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });
    vehicleRepository.findByLicensePlate.mockResolvedValue({
      id: 'other-vehicle-id',
      licensePlate: 'CD456EF',
      brand: 'Volvo',
      model: 'FH',
      isActive: true,
    });

    await expect(
      vehicleService.updateOwnVehicle('account-id', 'vehicle-id', {
        licensePlate: 'cd456ef',
      }),
    ).rejects.toThrow(ConflictException);

    expect(vehicleRepository.updateById).not.toHaveBeenCalled();
  });

  it('deactivates an owned vehicle without hard deleting it', async () => {
    vehicleRepository.findOwnedById.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });
    vehicleRepository.updateById.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: false,
    });

    await expect(
      vehicleService.deactivateOwnVehicle('account-id', 'vehicle-id'),
    ).resolves.toEqual({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: false,
    });

    expect(vehicleRepository.updateById).toHaveBeenCalledWith('vehicle-id', {
      isActive: false,
    });
  });
});
