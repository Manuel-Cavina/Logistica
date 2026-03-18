import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  // TODO: move to ConfigService when auth.config.ts is implemented (#18)
  // so Argon2 cost parameters can be tuned per environment.
  private readonly ARGON2_OPTIONS: Readonly<argon2.Options> = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  };

  async hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, this.ARGON2_OPTIONS);
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, plainPassword);
  }

  needsRehash(passwordHash: string): boolean {
    const { memoryCost, parallelism, timeCost, version } = this.ARGON2_OPTIONS;
    const rehashOptions = version
      ? {
          memoryCost,
          parallelism,
          timeCost,
          version,
        }
      : {
          memoryCost,
          parallelism,
          timeCost,
        };

    return argon2.needsRehash(passwordHash, rehashOptions);
  }
}
