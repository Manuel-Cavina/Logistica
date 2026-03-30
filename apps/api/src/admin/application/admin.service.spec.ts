import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const adminTransporterRepository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    updateVerificationStatus: jest.fn(),
  };

  let adminService: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService(adminTransporterRepository as never);
  });

  it('returns the transporter list with only the allowed public fields', async () => {
    adminTransporterRepository.findMany.mockResolvedValue([
      {
        id: 'transporter-profile-id',
        displayName: 'Acme Transportes',
        contactPhone: '+54 9 11 1234 5678',
        verificationStatus: 'PENDING',
      },
    ]);

    await expect(adminService.listTransporters({})).resolves.toEqual([
      {
        id: 'transporter-profile-id',
        displayName: 'Acme Transportes',
        contactPhone: '+54 9 11 1234 5678',
        verificationStatus: 'PENDING',
      },
    ]);

    expect(adminTransporterRepository.findMany).toHaveBeenCalledWith({
      status: undefined,
    });
  });

  it('delegates the verification status filter to the repository', async () => {
    adminTransporterRepository.findMany.mockResolvedValue([]);

    await adminService.listTransporters({ status: 'VERIFIED' });

    expect(adminTransporterRepository.findMany).toHaveBeenCalledWith({
      status: 'VERIFIED',
    });
  });

  it('returns the transporter detail with only the allowed public fields', async () => {
    adminTransporterRepository.findById.mockResolvedValue({
      id: 'transporter-profile-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });

    await expect(
      adminService.getTransporterDetail('transporter-profile-id'),
    ).resolves.toEqual({
      id: 'transporter-profile-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });
  });

  it('throws NotFoundException when the transporter profile does not exist', async () => {
    adminTransporterRepository.findById.mockResolvedValue(null);

    await expect(
      adminService.getTransporterDetail('missing-transporter-profile-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates the transporter verification status when the transition is valid', async () => {
    adminTransporterRepository.findById.mockResolvedValue({
      id: 'transporter-profile-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
    });
    adminTransporterRepository.updateVerificationStatus.mockResolvedValue({
      id: 'transporter-profile-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });

    await expect(
      adminService.updateTransporterVerificationStatus(
        'transporter-profile-id',
        {
          verificationStatus: 'VERIFIED',
        },
      ),
    ).resolves.toEqual({
      id: 'transporter-profile-id',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });

    expect(
      adminTransporterRepository.updateVerificationStatus,
    ).toHaveBeenCalledWith('transporter-profile-id', 'VERIFIED');
  });

  it('throws NotFoundException when updating a missing transporter profile', async () => {
    adminTransporterRepository.findById.mockResolvedValue(null);

    await expect(
      adminService.updateTransporterVerificationStatus(
        'missing-transporter-profile-id',
        {
          verificationStatus: 'VERIFIED',
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(
      adminTransporterRepository.updateVerificationStatus,
    ).not.toHaveBeenCalled();
  });

  it.each(['INCOMPLETE', 'VERIFIED', 'REJECTED'] as const)(
    'throws ConflictException when the current verification status is %s',
    async (verificationStatus) => {
      adminTransporterRepository.findById.mockResolvedValue({
        id: 'transporter-profile-id',
        displayName: 'Acme Transportes',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus,
      });

      await expect(
        adminService.updateTransporterVerificationStatus(
          'transporter-profile-id',
          {
            verificationStatus: 'REJECTED',
          },
        ),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(
        adminTransporterRepository.updateVerificationStatus,
      ).not.toHaveBeenCalled();
    },
  );
});
