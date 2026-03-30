import { AdminService } from './admin.service';

describe('AdminService', () => {
  const adminTransporterRepository = {
    findMany: jest.fn(),
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
});
