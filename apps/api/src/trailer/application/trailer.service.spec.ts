import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrailerService } from './trailer.service';

describe('TrailerService', () => {
  const trailerRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    findOwnedById: jest.fn(),
    findOwnedByAccountId: jest.fn(),
    hasActiveTrailer: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  };

  let trailerService: TrailerService;

  beforeEach(() => {
    jest.clearAllMocks();
    trailerService = new TrailerService(trailerRepository as never);
  });

  it('lists the authenticated transporter trailers with active ones first', async () => {
    trailerRepository.findOwnedByAccountId.mockResolvedValue([
      {
        id: 'trailer-active-id',
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
        isActive: true,
      },
      {
        id: 'trailer-inactive-id',
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
        isActive: false,
      },
    ]);

    await expect(trailerService.listOwnTrailers('account-id')).resolves.toEqual(
      [
        {
          id: 'trailer-active-id',
          totalCapacity: 12,
          cargoType: 'EQUINE',
          capacityUnit: 'SLOT',
          isActive: true,
        },
        {
          id: 'trailer-inactive-id',
          totalCapacity: 16,
          cargoType: 'GENERAL_CARGO',
          capacityUnit: 'KG',
          isActive: false,
        },
      ],
    );

    expect(trailerRepository.findOwnedByAccountId).toHaveBeenCalledWith(
      'account-id',
    );
  });

  it('returns whether the authenticated transporter has at least one active trailer', async () => {
    trailerRepository.hasActiveTrailer.mockResolvedValue(true);

    await expect(trailerService.hasActiveTrailer('account-id')).resolves.toBe(
      true,
    );

    expect(trailerRepository.hasActiveTrailer).toHaveBeenCalledWith(
      'account-id',
    );
  });

  it('returns false when the authenticated transporter has no active trailer', async () => {
    trailerRepository.hasActiveTrailer.mockResolvedValue(false);

    await expect(trailerService.hasActiveTrailer('account-id')).resolves.toBe(
      false,
    );

    expect(trailerRepository.hasActiveTrailer).toHaveBeenCalledWith(
      'account-id',
    );
  });

  it('creates a trailer for the authenticated transporter', async () => {
    trailerRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    trailerRepository.create.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });

    await expect(
      trailerService.createOwnTrailer('account-id', {
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      }),
    ).resolves.toEqual({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });

    expect(
      trailerRepository.findTransporterProfileByAccountId,
    ).toHaveBeenCalledWith('account-id');
    expect(trailerRepository.create).toHaveBeenCalledWith(
      'transporter-profile-id',
      {
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      },
    );
  });

  it('throws when the authenticated account has no transporter profile', async () => {
    trailerRepository.findTransporterProfileByAccountId.mockResolvedValue(null);

    await expect(
      trailerService.createOwnTrailer('missing-account', {
        totalCapacity: 10,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(trailerRepository.create).not.toHaveBeenCalled();
  });

  it('throws when the provided capacity is not operationally valid', async () => {
    trailerRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      trailerService.createOwnTrailer('account-id', {
        totalCapacity: 0,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(trailerRepository.create).not.toHaveBeenCalled();
  });

  it('updates an owned trailer', async () => {
    trailerRepository.findOwnedById.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });
    trailerRepository.updateById.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 16,
      cargoType: 'GENERAL_CARGO',
      capacityUnit: 'KG',
      isActive: true,
    });

    await expect(
      trailerService.updateOwnTrailer('account-id', 'trailer-id', {
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
      }),
    ).resolves.toEqual({
      id: 'trailer-id',
      totalCapacity: 16,
      cargoType: 'GENERAL_CARGO',
      capacityUnit: 'KG',
      isActive: true,
    });

    expect(trailerRepository.findOwnedById).toHaveBeenCalledWith(
      'account-id',
      'trailer-id',
    );
    expect(trailerRepository.updateById).toHaveBeenCalledWith('trailer-id', {
      totalCapacity: 16,
      cargoType: 'GENERAL_CARGO',
      capacityUnit: 'KG',
    });
  });

  it('throws when updating a trailer that is not owned by the account', async () => {
    trailerRepository.findOwnedById.mockResolvedValue(null);

    await expect(
      trailerService.updateOwnTrailer('account-id', 'trailer-id', {
        totalCapacity: 14,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(trailerRepository.updateById).not.toHaveBeenCalled();
  });

  it('throws when updating a trailer with an invalid capacity', async () => {
    trailerRepository.findOwnedById.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });

    await expect(
      trailerService.updateOwnTrailer('account-id', 'trailer-id', {
        totalCapacity: 0,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(trailerRepository.updateById).not.toHaveBeenCalled();
  });

  it('deactivates an owned trailer without hard deleting it', async () => {
    trailerRepository.findOwnedById.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });
    trailerRepository.updateById.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: false,
    });

    await expect(
      trailerService.deactivateOwnTrailer('account-id', 'trailer-id'),
    ).resolves.toEqual({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: false,
    });

    expect(trailerRepository.updateById).toHaveBeenCalledWith('trailer-id', {
      isActive: false,
    });
  });
});
