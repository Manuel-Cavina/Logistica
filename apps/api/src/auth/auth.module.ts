import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccountsModule } from '../accounts/accounts.module';
import { getAuthConfiguration } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthTokenService } from './services/auth-token.service';

@Module({
  imports: [
    AccountsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfig = getAuthConfiguration(configService);

        return {
          secret: authConfig.accessTokenSecret,
          signOptions: {
            expiresIn: authConfig.accessTokenTtlSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    AuthTokenService,
    AuthSessionService,
  ],
  exports: [PasswordService],
})
export class AuthModule {}
