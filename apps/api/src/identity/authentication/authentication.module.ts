import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '@logistica/database';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthenticationService } from './application/authentication.service';
import { AUTH_THROTTLER_OPTIONS } from './authentication-throttling.config';
import { AuthSessionService } from './application/auth-session.service';
import { AuthTokenService } from './application/auth-token.service';
import { PasswordService } from './application/password.service';
import { AuthenticationController } from './authentication.controller';
import { getAuthenticationConfiguration } from './cookies/authentication-cookie.config';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SessionsRepository } from './repositories/sessions.repository';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';

@Module({
  imports: [
    AccountsModule,
    PrismaModule,
    PassportModule,
    ThrottlerModule.forRoot(AUTH_THROTTLER_OPTIONS),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfig = getAuthenticationConfiguration(configService);

        return {
          secret: authConfig.accessTokenSecret,
          signOptions: {
            expiresIn: authConfig.accessTokenTtlSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    PasswordService,
    AuthTokenService,
    AuthSessionService,
    SessionsRepository,
    JwtAccessStrategy,
    JwtAuthGuard,
    AuthRateLimitGuard,
    RolesGuard,
  ],
  exports: [PasswordService],
})
export class AuthenticationModule {}
