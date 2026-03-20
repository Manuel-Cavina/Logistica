import type { ThrottlerModuleOptions } from '@nestjs/throttler';

const ONE_MINUTE_IN_MS = 60_000;

export const AUTH_LOGIN_THROTTLE = {
  login: {
    limit: 5,
    ttl: ONE_MINUTE_IN_MS,
  },
} as const;

export const AUTH_REGISTER_THROTTLE = {
  register: {
    limit: 3,
    ttl: ONE_MINUTE_IN_MS,
  },
} as const;

export const AUTH_THROTTLER_OPTIONS: ThrottlerModuleOptions = {
  errorMessage: 'Too many requests, please try again later.',
  throttlers: [
    {
      name: 'login',
      ...AUTH_LOGIN_THROTTLE.login,
    },
    {
      name: 'register',
      ...AUTH_REGISTER_THROTTLE.register,
    },
  ],
};
