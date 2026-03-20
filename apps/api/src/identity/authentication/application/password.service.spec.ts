import * as argon2 from 'argon2';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const plainPassword = 'Sup3r-Str0ng-Password!';
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  it('hashPassword returns a hash different from the plain password', async () => {
    const passwordHash = await passwordService.hashPassword(plainPassword);

    expect(passwordHash).not.toBe(plainPassword);
  });

  it('hashPassword uses Argon2id', async () => {
    const passwordHash = await passwordService.hashPassword(plainPassword);

    expect(passwordHash.startsWith('$argon2id$')).toBe(true);
  });

  it('hashPassword returns different hashes for the same password', async () => {
    const firstHash = await passwordService.hashPassword(plainPassword);
    const secondHash = await passwordService.hashPassword(plainPassword);

    expect(firstHash).not.toBe(secondHash);
  });

  it('verifyPassword returns true for the correct password', async () => {
    const passwordHash = await passwordService.hashPassword(plainPassword);

    await expect(
      passwordService.verifyPassword(plainPassword, passwordHash),
    ).resolves.toBe(true);
  });

  it('verifyPassword returns false for an incorrect password', async () => {
    const passwordHash = await passwordService.hashPassword(plainPassword);

    await expect(
      passwordService.verifyPassword('wrong-password', passwordHash),
    ).resolves.toBe(false);
  });

  it('needsRehash returns false for hashes generated with the current config', async () => {
    const passwordHash = await passwordService.hashPassword(plainPassword);

    expect(passwordService.needsRehash(passwordHash)).toBe(false);
  });

  it('needsRehash returns true for hashes generated with a different config', async () => {
    const passwordHash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 15,
      timeCost: 2,
      parallelism: 1,
    });

    expect(passwordService.needsRehash(passwordHash)).toBe(true);
  });
});
