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

  it('updates the authenticated transporter profile with allowed fields only', async () => {
    transporterProfileRepository.findByAccountId.mockResolvedValue({
      id: 'profile-id',
      accountId: 'account-id',
      displayName: 'Acme Transportes',
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
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'profile-id',
        accountId: 'account-id',
        displayName: 'Acme Transportes SA',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
      }),
    );

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
});
