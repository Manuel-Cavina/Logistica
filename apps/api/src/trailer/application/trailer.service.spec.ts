import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrailerService } from './trailer.service';

describe('TrailerService', () => {
  const trailerRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    create: jest.fn(),
  };

  let trailerService: TrailerService;

  beforeEach(() => {
    jest.clearAllMocks();
    trailerService = new TrailerService(trailerRepository as never);
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
});
