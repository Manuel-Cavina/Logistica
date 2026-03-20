import { Injectable, Logger, type ExecutionContext } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  type ThrottlerLimitDetail,
} from '@nestjs/throttler';

interface RateLimitedRequest {
  headers?: {
    'user-agent'?: string | string[];
  };
  ip?: string | null;
  method?: string;
  originalUrl?: string;
  url?: string;
}

@Injectable()
export class AuthRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AuthRateLimitGuard.name);

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { req } = this.getRequestResponse(context) as {
      req: RateLimitedRequest;
    };
    const userAgentHeader = req.headers?.['user-agent'];

    this.logger.warn(
      JSON.stringify({
        event: 'rate_limit_hit',
        method: req.method ?? null,
        path: req.originalUrl ?? req.url ?? null,
        ipAddress: req.ip ?? null,
        userAgent:
          typeof userAgentHeader === 'string'
            ? userAgentHeader
            : (userAgentHeader?.[0] ?? null),
        tracker: throttlerLimitDetail.tracker,
        limit: throttlerLimitDetail.limit,
        ttl: throttlerLimitDetail.ttl,
      }),
    );

    throw new ThrottlerException(
      await this.getErrorMessage(context, throttlerLimitDetail),
    );
  }
}
