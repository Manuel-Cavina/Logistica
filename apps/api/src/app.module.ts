import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(process.cwd(), '../../.env'), '.env'],
      validate: (config: Record<string, unknown>) => {
        if (!config.DATABASE_URL) {
          throw new Error('DATABASE_URL is required');
        }
        if (!config.AUTH_ACCESS_TOKEN_SECRET) {
          throw new Error('AUTH_ACCESS_TOKEN_SECRET is required');
        }
        if (!config.AUTH_REFRESH_TOKEN_SECRET) {
          throw new Error('AUTH_REFRESH_TOKEN_SECRET is required');
        }
        if (!config.AUTH_ACCESS_TOKEN_TTL_SECONDS) {
          throw new Error('AUTH_ACCESS_TOKEN_TTL_SECONDS is required');
        }
        if (!config.AUTH_REFRESH_TOKEN_TTL_SECONDS) {
          throw new Error('AUTH_REFRESH_TOKEN_TTL_SECONDS is required');
        }

        return config;
      },
    }),
    AccountsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
