import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AccountsService } from '../accounts/accounts.service';
import type { AccountWithProfiles } from '../accounts/accounts.types';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.types';
import { PasswordService } from './password.service';

const createClientAccountFixture = (): AccountWithProfiles => ({
  id: 'cmf1n41s30000m1k9c27d0001',
  email: 'client@example.com',
  passwordHash: 'stored-hash',
  role: 'CLIENT',
  status: 'ACTIVE',
  isEmailVerified: false,
  lastLoginAt: null,
  createdAt: new Date('2026-03-18T00:00:00.000Z'),
  updatedAt: new Date('2026-03-18T00:00:00.000Z'),
  userProfile: {
    id: 'cmf1n41s30000m1k9c27d1001',
    accountId: 'cmf1n41s30000m1k9c27d0001',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+5491112345678',
    createdAt: new Date('2026-03-18T00:00:00.000Z'),
    updatedAt: new Date('2026-03-18T00:00:00.000Z'),
  },
  transporterProfile: null,
});

describe('AuthService', () => {
  let authService: AuthService;
  let accountsService: {
    findByEmail: jest.Mock;
    createClientAccount: jest.Mock;
    createTransporterAccount: jest.Mock;
  };
  let passwordService: {
    hash: jest.Mock;
    verify: jest.Mock;
  };

  beforeEach(async () => {
    accountsService = {
      findByEmail: jest.fn(),
      createClientAccount: jest.fn(),
      createTransporterAccount: jest.fn(),
    };
    passwordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AccountsService,
          useValue: accountsService,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('register creates a client user and returns a safe view', async () => {
    const registerDto: RegisterDto = {
      email: 'client@example.com',
      password: 'Sup3r-Str0ng-Password!',
      role: 'CLIENT',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+5491112345678',
    };
    const account = createClientAccountFixture();

    passwordService.hash.mockResolvedValue('hashed-password');
    accountsService.createClientAccount.mockResolvedValue(account);

    await expect(authService.register(registerDto)).resolves.toEqual({
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        isEmailVerified: account.isEmailVerified,
      },
      profile: {
        id: account.userProfile!.id,
        firstName: account.userProfile!.firstName,
        lastName: account.userProfile!.lastName,
        phone: account.userProfile!.phone,
      },
    });

    expect(passwordService.hash).toHaveBeenCalledWith(registerDto.password);
    expect(accountsService.createClientAccount).toHaveBeenCalledWith({
      email: registerDto.email,
      passwordHash: 'hashed-password',
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
    });
  });

  it('register rejects ADMIN role', async () => {
    const registerDto: RegisterDto = {
      email: 'admin@example.com',
      password: 'Sup3r-Str0ng-Password!',
      role: 'ADMIN',
    };

    await expect(authService.register(registerDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(accountsService.createClientAccount).not.toHaveBeenCalled();
    expect(accountsService.createTransporterAccount).not.toHaveBeenCalled();
  });

  it('login returns a safe user view for valid credentials', async () => {
    const loginDto: LoginDto = {
      email: 'client@example.com',
      password: 'Sup3r-Str0ng-Password!',
    };
    const account = createClientAccountFixture();

    accountsService.findByEmail.mockResolvedValue(account);
    passwordService.verify.mockResolvedValue(true);

    await expect(authService.login(loginDto)).resolves.toEqual({
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        isEmailVerified: account.isEmailVerified,
      },
      profile: {
        id: account.userProfile!.id,
        firstName: account.userProfile!.firstName,
        lastName: account.userProfile!.lastName,
        phone: account.userProfile!.phone,
      },
    });

    expect(accountsService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(passwordService.verify).toHaveBeenCalledWith(
      loginDto.password,
      account.passwordHash,
    );
  });

  it('login fails when password is incorrect', async () => {
    const loginDto: LoginDto = {
      email: 'client@example.com',
      password: 'wrong-password',
    };

    accountsService.findByEmail.mockResolvedValue(createClientAccountFixture());
    passwordService.verify.mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login fails when email does not exist', async () => {
    const loginDto: LoginDto = {
      email: 'missing@example.com',
      password: 'Sup3r-Str0ng-Password!',
    };

    accountsService.findByEmail.mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(passwordService.verify).not.toHaveBeenCalled();
  });

  it('login uses the same error message for missing email and wrong password', async () => {
    const loginDto: LoginDto = {
      email: 'client@example.com',
      password: 'wrong-password',
    };

    accountsService.findByEmail.mockResolvedValue(createClientAccountFixture());
    passwordService.verify.mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toMatchObject({
      message: 'Invalid credentials',
    });

    accountsService.findByEmail.mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toMatchObject({
      message: 'Invalid credentials',
    });
  });
});
