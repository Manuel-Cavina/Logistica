import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TripOfferStatus } from '@logistica/database';
import { TripOfferService } from './trip-offer.service';

const createTripOfferRecord = (
  overrides: Partial<Record<string, unknown>> = {},
) => ({
  id: 'trip-offer-id',
  transporterProfileId: 'transporter-profile-id',
  originLabel: 'Buenos Aires',
  originLat: new Prisma.Decimal('-34.603722'),
  originLng: new Prisma.Decimal('-58.381592'),
  destinationLabel: 'Rosario',
  destinationLat: new Prisma.Decimal('-32.944243'),
  destinationLng: new Prisma.Decimal('-60.650539'),
  departureDate: new Date('2026-05-01T00:00:00.000Z'),
  departureWindowStart: null,
  departureWindowEnd: null,
  capacityTotal: 6,
  availableCapacity: 6,
  pricePerSlot: 120000,
  maxDetourKm: 50,
  notes: 'Salida temprana',
  cancellationPolicy: 'Flexible',
  cargoType: 'EQUINE',
  isReturn: false,
  status: TripOfferStatus.DRAFT,
  createdAt: new Date('2026-04-21T10:00:00.000Z'),
  updatedAt: new Date('2026-04-21T10:00:00.000Z'),
  ...overrides,
});

describe('TripOfferService', () => {
  const tripOfferRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    findById: jest.fn(),
    findOwnedByAccountId: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    updateStatusById: jest.fn(),
  };

  let tripOfferService: TripOfferService;

  beforeEach(() => {
    jest.clearAllMocks();
    tripOfferService = new TripOfferService(tripOfferRepository as never);
  });

  it('creates a draft trip offer for the authenticated transporter', async () => {
    const createdAt = new Date('2026-04-21T10:00:00.000Z');
    const updatedAt = new Date('2026-04-21T10:00:00.000Z');
    const departureDate = new Date('2026-05-01T00:00:00.000Z');

    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.create.mockResolvedValue(
      createTripOfferRecord({
        departureDate,
        createdAt,
        updatedAt,
      }),
    );

    await expect(
      tripOfferService.createOwnTripOffer('account-id', {
        originLabel: ' Buenos Aires ',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: ' Rosario ',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate,
        departureWindowStart: null,
        departureWindowEnd: null,
        capacityTotal: 6,
        availableCapacity: 2,
        pricePerSlot: 120000,
        maxDetourKm: 50,
        notes: ' Salida temprana ',
        cancellationPolicy: ' Flexible ',
        cargoType: 'EQUINE',
        isReturn: false,
      }),
    ).resolves.toEqual({
      id: 'trip-offer-id',
      originLabel: 'Buenos Aires',
      originLat: -34.603722,
      originLng: -58.381592,
      destinationLabel: 'Rosario',
      destinationLat: -32.944243,
      destinationLng: -60.650539,
      departureDate,
      departureWindowStart: null,
      departureWindowEnd: null,
      capacityTotal: 6,
      availableCapacity: 6,
      pricePerSlot: 120000,
      maxDetourKm: 50,
      notes: 'Salida temprana',
      cancellationPolicy: 'Flexible',
      cargoType: 'EQUINE',
      isReturn: false,
      status: 'DRAFT',
      createdAt,
      updatedAt,
    });

    expect(
      tripOfferRepository.findTransporterProfileByAccountId,
    ).toHaveBeenCalledWith('account-id');
    expect(tripOfferRepository.create).toHaveBeenCalledWith(
      'transporter-profile-id',
      expect.objectContaining({
        originLabel: 'Buenos Aires',
        destinationLabel: 'Rosario',
        capacityTotal: 6,
        availableCapacity: 6,
        notes: 'Salida temprana',
        cancellationPolicy: 'Flexible',
      }),
    );
  });

  it('throws when the authenticated account has no transporter profile', async () => {
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue(
      null,
    );

    await expect(
      tripOfferService.createOwnTripOffer('missing-account', {
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: new Date('2026-05-01T00:00:00.000Z'),
        departureWindowStart: null,
        departureWindowEnd: null,
        capacityTotal: 6,
        availableCapacity: 6,
        pricePerSlot: 120000,
        maxDetourKm: 50,
        notes: null,
        cancellationPolicy: null,
        cargoType: 'EQUINE',
        isReturn: false,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when creating a trip offer with an invalid temporal modality', async () => {
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.createOwnTripOffer('account-id', {
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: new Date('2026-05-01T00:00:00.000Z'),
        departureWindowStart: new Date('2026-05-01T08:00:00.000Z'),
        departureWindowEnd: new Date('2026-05-01T12:00:00.000Z'),
        capacityTotal: 6,
        availableCapacity: 6,
        pricePerSlot: 120000,
        maxDetourKm: 50,
        notes: null,
        cancellationPolicy: null,
        cargoType: 'EQUINE',
        isReturn: false,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(tripOfferRepository.create).not.toHaveBeenCalled();
  });

  it('lists only the authenticated transporter trip offers', async () => {
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.findOwnedByAccountId.mockResolvedValue([
      createTripOfferRecord(),
      createTripOfferRecord({
        id: 'trip-offer-full-id',
        availableCapacity: 0,
        status: TripOfferStatus.PUBLISHED,
      }),
    ]);

    await expect(
      tripOfferService.listOwnTripOffers('account-id'),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'trip-offer-id',
        status: 'DRAFT',
      }),
      expect.objectContaining({
        id: 'trip-offer-full-id',
        status: 'FULL',
      }),
    ]);

    expect(tripOfferRepository.findOwnedByAccountId).toHaveBeenCalledWith(
      'account-id',
    );
  });

  it('publishes an owned draft trip offer as PUBLISHED when capacity remains', async () => {
    tripOfferRepository.findById.mockResolvedValue(createTripOfferRecord());
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateStatusById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.PUBLISHED,
      }),
    );

    await expect(
      tripOfferService.publishOwnTripOffer('account-id', 'trip-offer-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'trip-offer-id',
        status: 'PUBLISHED',
      }),
    );

    expect(tripOfferRepository.updateStatusById).toHaveBeenCalledWith(
      'trip-offer-id',
      TripOfferStatus.PUBLISHED,
    );
  });

  it('publishes an owned draft trip offer as FULL when availableCapacity is zero', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        availableCapacity: 0,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateStatusById.mockResolvedValue(
      createTripOfferRecord({
        availableCapacity: 0,
        status: TripOfferStatus.FULL,
      }),
    );

    await expect(
      tripOfferService.publishOwnTripOffer('account-id', 'trip-offer-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'FULL',
      }),
    );

    expect(tripOfferRepository.updateStatusById).toHaveBeenCalledWith(
      'trip-offer-id',
      TripOfferStatus.FULL,
    );
  });

  it('throws when publishing a trip offer that does not exist', async () => {
    tripOfferRepository.findById.mockResolvedValue(null);

    await expect(
      tripOfferService.publishOwnTripOffer('account-id', 'missing-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when publishing a trip offer owned by another transporter', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        transporterProfileId: 'other-transporter-profile-id',
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.publishOwnTripOffer('account-id', 'trip-offer-id'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when publishing a trip offer outside draft status', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.CANCELLED,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.publishOwnTripOffer('account-id', 'trip-offer-id'),
    ).rejects.toThrow(ConflictException);
  });

  it('updates an owned draft trip offer and resyncs available capacity', async () => {
    const updatedAt = new Date('2026-04-21T12:00:00.000Z');

    tripOfferRepository.findById.mockResolvedValue(createTripOfferRecord());
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateById.mockResolvedValue(
      createTripOfferRecord({
        destinationLabel: 'Cordoba',
        destinationLat: new Prisma.Decimal('-31.420083'),
        destinationLng: new Prisma.Decimal('-64.188776'),
        departureDate: null,
        departureWindowStart: new Date('2026-05-02T08:00:00.000Z'),
        departureWindowEnd: new Date('2026-05-02T12:00:00.000Z'),
        capacityTotal: 10,
        availableCapacity: 10,
        pricePerSlot: 140000,
        maxDetourKm: 70,
        notes: null,
        cancellationPolicy: 'Moderada',
        cargoType: 'GENERAL_CARGO',
        isReturn: true,
        updatedAt,
      }),
    );

    await expect(
      tripOfferService.updateOwnTripOffer('account-id', 'trip-offer-id', {
        destinationLabel: ' Cordoba ',
        destinationLat: -31.420083,
        destinationLng: -64.188776,
        departureDate: null,
        departureWindowStart: new Date('2026-05-02T08:00:00.000Z'),
        departureWindowEnd: new Date('2026-05-02T12:00:00.000Z'),
        capacityTotal: 10,
        availableCapacity: 1,
        pricePerSlot: 140000,
        maxDetourKm: 70,
        notes: '   ',
        cancellationPolicy: ' Moderada ',
        cargoType: 'GENERAL_CARGO',
        isReturn: true,
      }),
    ).resolves.toEqual({
      id: 'trip-offer-id',
      originLabel: 'Buenos Aires',
      originLat: -34.603722,
      originLng: -58.381592,
      destinationLabel: 'Cordoba',
      destinationLat: -31.420083,
      destinationLng: -64.188776,
      departureDate: null,
      departureWindowStart: new Date('2026-05-02T08:00:00.000Z'),
      departureWindowEnd: new Date('2026-05-02T12:00:00.000Z'),
      capacityTotal: 10,
      availableCapacity: 10,
      pricePerSlot: 140000,
      maxDetourKm: 70,
      notes: null,
      cancellationPolicy: 'Moderada',
      cargoType: 'GENERAL_CARGO',
      isReturn: true,
      status: 'DRAFT',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt,
    });

    expect(tripOfferRepository.updateById).toHaveBeenCalledWith(
      'trip-offer-id',
      expect.objectContaining({
        destinationLabel: 'Cordoba',
        capacityTotal: 10,
        availableCapacity: 10,
        notes: null,
        cancellationPolicy: 'Moderada',
      }),
    );
  });

  it('throws when updating a trip offer that does not exist', async () => {
    tripOfferRepository.findById.mockResolvedValue(null);

    await expect(
      tripOfferService.updateOwnTripOffer('account-id', 'missing-id', {
        pricePerSlot: 140000,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when updating a trip offer owned by another transporter', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        transporterProfileId: 'other-transporter-profile-id',
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.updateOwnTripOffer('account-id', 'trip-offer-id', {
        pricePerSlot: 140000,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when updating a trip offer that is no longer in draft', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.PUBLISHED,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.updateOwnTripOffer('account-id', 'trip-offer-id', {
        pricePerSlot: 140000,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('closes an owned trip offer from a permitted status', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.FULL,
        availableCapacity: 0,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateStatusById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.CLOSED,
        availableCapacity: 0,
      }),
    );

    await expect(
      tripOfferService.closeOwnTripOffer('account-id', 'trip-offer-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'CLOSED',
      }),
    );
  });

  it('throws when closing a trip offer in a non-operable status', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.CANCELLED,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.closeOwnTripOffer('account-id', 'trip-offer-id'),
    ).rejects.toThrow(ConflictException);
  });

  it('cancels an owned trip offer from a permitted status', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.PUBLISHED,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateStatusById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.CANCELLED,
      }),
    );

    await expect(
      tripOfferService.cancelOwnTripOffer('account-id', 'trip-offer-id'),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'CANCELLED',
      }),
    );
  });

  it('throws when cancelling a trip offer in a non-operable status', async () => {
    tripOfferRepository.findById.mockResolvedValue(
      createTripOfferRecord({
        status: TripOfferStatus.CLOSED,
      }),
    );
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.cancelOwnTripOffer('account-id', 'trip-offer-id'),
    ).rejects.toThrow(ConflictException);
  });
});
