import { NotFoundException } from '@nestjs/common';
import { TransporterProfileService } from './transporter-profile.service';

describe('TransporterProfileService', () => {
  const transporterProfileRepository = {
    findByAccountId: jest.fn(),
    updateByAccountId: jest.fn(),
  };

  let transporterProfileService: TransporterProfileService;

  beforeEach(() => {
    jest.clearAllMocks();
    transporterProfileService = new TransporterProfileService(
      transporterProfileRepository as never,
    );
  });

  it('returns the authenticated transporter profile with only the allowed response fields', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
      createdAt: new Date('2026-03-30T00:00:00.000Z'),
      updatedAt: new Date('2026-03-30T00:00:00.000Z'),
    });

    await expect(
      transporterProfileService.getOwnProfile('account-id'),
    ).resolves.toEqual({
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
    });

    expect(transporterProfileRepository.findByAccountId).toHaveBeenCalledWith(
      'account-id',
    );
  });

  it('returns a controlled error when reading the authenticated profile and no transporter profile exists', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue(null);

    await expect(
      transporterProfileService.getOwnProfile('missing-account-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates the authenticated transporter profile with allowed fields only', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: null,
      verificationStatus: 'INCOMPLETE',
    });
    transporterProfileRepository.updateByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes SA',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'INCOMPLETE',
    });

    await expect(
      transporterProfileService.updateOwnProfile('account-id', {
        displayName: '  Acme Transportes SA  ',
        businessName: ' Acme Transportes SA ',
        contactPhone: ' +54 9 11 1234 5678 ',
        bio: ' Traslados de equinos. ',
        maxDetourKmDefault: 120,
      }),
    ).resolves.toEqual({
      displayName: 'Acme Transportes SA',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'INCOMPLETE',
    });

    expect(transporterProfileRepository.findByAccountId).toHaveBeenCalledWith(
      'account-id',
    );
    expect(transporterProfileRepository.updateByAccountId).toHaveBeenCalledWith(
      'account-id',
      {
        displayName: 'Acme Transportes SA',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus: 'PENDING',
      },
    );
  });

  it('returns a controlled error when the authenticated account has no transporter profile', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue(null);

    await expect(
      transporterProfileService.updateOwnProfile('missing-account-id', {
        displayName: 'Transportes del Sur',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(
      transporterProfileRepository.updateByAccountId,
    ).not.toHaveBeenCalled();
  });

  it('allows clearing nullable fields without touching verification status', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: '+54 9 11 1234 5678',
      verificationStatus: 'PENDING',
    });
    transporterProfileRepository.updateByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      businessName: null,
      contactPhone: null,
      bio: null,
      maxDetourKmDefault: null,
      verificationStatus: 'PENDING',
    });

    await transporterProfileService.updateOwnProfile('account-id', {
      businessName: '   ',
      contactPhone: null,
      bio: ' ',
      maxDetourKmDefault: null,
    });

    expect(transporterProfileRepository.updateByAccountId).toHaveBeenCalledWith(
      'account-id',
      {
        businessName: null,
        contactPhone: null,
        bio: null,
        maxDetourKmDefault: null,
      },
    );
  });

  it('returns the updated profile with the same public shape used by the get endpoint', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: '+54 9 11 1234 5678',
      verificationStatus: 'PENDING',
    });
    transporterProfileRepository.updateByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados premium.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
      createdAt: new Date('2026-03-30T00:00:00.000Z'),
      updatedAt: new Date('2026-03-30T00:00:00.000Z'),
    });

    await expect(
      transporterProfileService.updateOwnProfile('account-id', {
        businessName: ' Acme Transportes SA ',
        bio: ' Traslados premium. ',
        maxDetourKmDefault: 120,
      }),
    ).resolves.toEqual({
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados premium.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
    });
  });

  it('does not transition to pending when the resulting profile is still incomplete', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: null,
      verificationStatus: 'INCOMPLETE',
    });
    transporterProfileRepository.updateByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: null,
      bio: 'Cobertura nacional.',
      verificationStatus: 'INCOMPLETE',
    });

    await transporterProfileService.updateOwnProfile('account-id', {
      bio: ' Cobertura nacional. ',
    });

    expect(transporterProfileRepository.updateByAccountId).toHaveBeenCalledWith(
      'account-id',
      {
        bio: 'Cobertura nacional.',
      },
    );
  });

  it('transitions to pending when the profile is already complete in storage and the update changes an irrelevant field', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: '+54 9 11 1234 5678',
      verificationStatus: 'INCOMPLETE',
    });
    transporterProfileRepository.updateByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados premium.',
      verificationStatus: 'PENDING',
    });

    await transporterProfileService.updateOwnProfile('account-id', {
      bio: ' Traslados premium. ',
    });

    expect(transporterProfileRepository.updateByAccountId).toHaveBeenCalledWith(
      'account-id',
      {
        bio: 'Traslados premium.',
        verificationStatus: 'PENDING',
      },
    );
  });

  it.each(['VERIFIED', 'REJECTED'] as const)(
    'keeps verification status unchanged when the profile is %s',
    async (verificationStatus) => {
      transporterProfileRepository.findByAccountId.mockResolvedValue({
        id: 'profile-id',
        accountId: 'account-id',
        displayName: 'Acme Transportes',
        contactPhone: '+54 9 11 1234 5678',
        verificationStatus,
      });
      transporterProfileRepository.updateByAccountId.mockResolvedValue({
        id: 'profile-id',
        accountId: 'account-id',
        displayName: 'Acme Transportes',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados premium.',
        verificationStatus,
      });

      await transporterProfileService.updateOwnProfile('account-id', {
        bio: ' Traslados premium. ',
      });

      expect(
        transporterProfileRepository.updateByAccountId,
      ).toHaveBeenCalledWith('account-id', {
        bio: 'Traslados premium.',
      });
    },
  );
});
