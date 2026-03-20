import { InternalServerErrorException } from '@nestjs/common';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const accountsRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createClientAccount: jest.fn(),
    createTransporterAccount: jest.fn(),
  };

  let accountsService: AccountsService;

  beforeEach(() => {
    jest.clearAllMocks();
    accountsService = new AccountsService(accountsRepository as never);
  });

  it('delegates account lookup by email to the repository', async () => {
    accountsRepository.findByEmail.mockResolvedValue({
      id: 'account-id',
      email: 'client@example.com',
    });

    await expect(
      accountsService.findByEmail('client@example.com'),
    ).resolves.toEqual({
      id: 'account-id',
      email: 'client@example.com',
    });

    expect(accountsRepository.findByEmail).toHaveBeenCalledWith(
      'client@example.com',
    );
  });

  it('delegates client account creation to the repository', async () => {
    accountsRepository.createClientAccount.mockResolvedValue({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
    });

    await expect(
      accountsService.createClientAccount({
        email: 'client@example.com',
        passwordHash: 'hash',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).resolves.toEqual({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
    });

    expect(accountsRepository.createClientAccount).toHaveBeenCalledWith({
      email: 'client@example.com',
      passwordHash: 'hash',
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });

  it('delegates transporter account creation to the repository', async () => {
    accountsRepository.createTransporterAccount.mockResolvedValue({
      id: 'transporter-account-id',
      email: 'transporter@example.com',
      role: 'TRANSPORTER',
      transporterProfile: {
        id: 'transporter-profile-id',
        displayName: 'Acme Transportes',
      },
    });

    await expect(
      accountsService.createTransporterAccount({
        email: 'transporter@example.com',
        passwordHash: 'hash',
        displayName: 'Acme Transportes',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'transporter-account-id',
        email: 'transporter@example.com',
        role: 'TRANSPORTER',
        transporterProfile: {
          id: 'transporter-profile-id',
          displayName: 'Acme Transportes',
        },
      }),
    );

    expect(accountsRepository.createTransporterAccount).toHaveBeenCalledWith({
      email: 'transporter@example.com',
      passwordHash: 'hash',
      displayName: 'Acme Transportes',
    });
  });

  it('rejects an inconsistent transporter account without transporterProfile', async () => {
    accountsRepository.createTransporterAccount.mockResolvedValue({
      id: 'transporter-account-id',
      email: 'transporter@example.com',
      role: 'TRANSPORTER',
      transporterProfile: null,
    });

    await expect(
      accountsService.createTransporterAccount({
        email: 'transporter@example.com',
        passwordHash: 'hash',
        displayName: 'Acme Transportes',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
