import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@logistica/database';
import { TripOfferService } from './trip-offer.service';

describe('TripOfferService', () => {
  const tripOfferRepository = {
    findTransporterProfileByAccountId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
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
    tripOfferRepository.create.mockResolvedValue({
      id: 'trip-offer-id',
      transporterProfileId: 'transporter-profile-id',
      originLabel: 'Buenos Aires',
      originLat: new Prisma.Decimal('-34.603722'),
      originLng: new Prisma.Decimal('-58.381592'),
      destinationLabel: 'Rosario',
      destinationLat: new Prisma.Decimal('-32.944243'),
      destinationLng: new Prisma.Decimal('-60.650539'),
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

  it('updates an owned draft trip offer and resyncs available capacity', async () => {
    const updatedAt = new Date('2026-04-21T12:00:00.000Z');

    tripOfferRepository.findById.mockResolvedValue({
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
      availableCapacity: 4,
      pricePerSlot: 120000,
      maxDetourKm: 50,
      notes: 'Salida temprana',
      cancellationPolicy: 'Flexible',
      cargoType: 'EQUINE',
      isReturn: false,
      status: 'DRAFT',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt: new Date('2026-04-21T10:00:00.000Z'),
    });
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });
    tripOfferRepository.updateById.mockResolvedValue({
      id: 'trip-offer-id',
      transporterProfileId: 'transporter-profile-id',
      originLabel: 'Buenos Aires',
      originLat: new Prisma.Decimal('-34.603722'),
      originLng: new Prisma.Decimal('-58.381592'),
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
      status: 'DRAFT',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt,
    });

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
    tripOfferRepository.findById.mockResolvedValue({
      id: 'trip-offer-id',
      transporterProfileId: 'other-transporter-profile-id',
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
      notes: null,
      cancellationPolicy: null,
      cargoType: 'EQUINE',
      isReturn: false,
      status: 'DRAFT',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt: new Date('2026-04-21T10:00:00.000Z'),
    });
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
    tripOfferRepository.findById.mockResolvedValue({
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
      notes: null,
      cancellationPolicy: null,
      cargoType: 'EQUINE',
      isReturn: false,
      status: 'PUBLISHED',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt: new Date('2026-04-21T10:00:00.000Z'),
    });
    tripOfferRepository.findTransporterProfileByAccountId.mockResolvedValue({
      id: 'transporter-profile-id',
    });

    await expect(
      tripOfferService.updateOwnTripOffer('account-id', 'trip-offer-id', {
        pricePerSlot: 140000,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
