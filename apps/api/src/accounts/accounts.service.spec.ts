import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  const prismaService = {
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let accountsService: AccountsService;

  beforeEach(() => {
    jest.clearAllMocks();
    accountsService = new AccountsService(prismaService as never);
  });

  it('revokes a single active session by id', async () => {
    const revokedAt = new Date('2026-03-18T20:00:00.000Z');
    prismaService.session.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      accountsService.revokeSession('session-id', revokedAt),
    ).resolves.toBe(1);

    expect(prismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'session-id',
        revokedAt: null,
      },
      data: { revokedAt },
    });
  });

  it('revokes all active sessions in the same token family', async () => {
    const revokedAt = new Date('2026-03-18T20:00:00.000Z');
    prismaService.session.updateMany.mockResolvedValue({ count: 2 });

    await expect(
      accountsService.revokeSessionFamily(
        'account-id',
        'token-family',
        revokedAt,
      ),
    ).resolves.toBe(2);

    expect(prismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        accountId: 'account-id',
        tokenFamily: 'token-family',
        revokedAt: null,
      },
      data: { revokedAt },
    });
  });

  it('revokes all active sessions for an account', async () => {
    const revokedAt = new Date('2026-03-18T20:00:00.000Z');
    prismaService.session.updateMany.mockResolvedValue({ count: 3 });

    await expect(
      accountsService.revokeSessionsByAccount('account-id', revokedAt),
    ).resolves.toBe(3);

    expect(prismaService.session.updateMany).toHaveBeenCalledWith({
      where: {
        accountId: 'account-id',
        revokedAt: null,
      },
      data: { revokedAt },
    });
  });
});
