import type { ConfigService } from '@nestjs/config';

export const DEVELOPMENT_ADMIN_ACCOUNT_ID = 'cm9adminmock0000wqz5oy7k8ph1';

export interface DevelopmentAdminAuthConfiguration {
  enabled: boolean;
  email: string;
  password: string;
  accountId: string;
}

function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function getDevelopmentAdminAuthConfiguration(
  configService: ConfigService,
): DevelopmentAdminAuthConfiguration {
  const email =
    configService.get<string>('AUTH_MOCK_ADMIN_EMAIL')?.trim() ?? '';
  const password = configService.get<string>('AUTH_MOCK_ADMIN_PASSWORD') ?? '';
  const isEnabled = parseBooleanFlag(
    configService.get<string>('AUTH_MOCK_ADMIN_ENABLED'),
  );
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

  if (isEnabled && nodeEnv === 'production') {
    return {
      enabled: false,
      email,
      password,
      accountId: DEVELOPMENT_ADMIN_ACCOUNT_ID,
    };
  }

  if (isEnabled && (!email || !password)) {
    throw new Error(
      'AUTH_MOCK_ADMIN_EMAIL and AUTH_MOCK_ADMIN_PASSWORD are required when AUTH_MOCK_ADMIN_ENABLED is enabled.',
    );
  }

  return {
    enabled: isEnabled,
    email,
    password,
    accountId: DEVELOPMENT_ADMIN_ACCOUNT_ID,
  };
}
