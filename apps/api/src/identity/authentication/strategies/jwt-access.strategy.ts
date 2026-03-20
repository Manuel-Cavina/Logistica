import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getAuthenticationConfiguration } from '../cookies/authentication-cookie.config';
import type {
  AccessTokenPayload,
  AuthenticatedAccount,
} from '../types/authentication.types';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        getAuthenticationConfiguration(configService).accessTokenSecret,
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
