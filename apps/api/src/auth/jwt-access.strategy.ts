import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getAuthConfiguration } from './auth.config';
import type { AccessTokenPayload, AuthenticatedAccount } from './auth.types';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getAuthConfiguration(configService).accessTokenSecret,
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedAccount {
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      accountId: payload.sub,
    };
  }
}
