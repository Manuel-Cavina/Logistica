import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import {
  LoginSchema,
  type ILoginResponse,
  type IMeResponse,
  type IRefreshResponse,
  type IRegisterResponse,
  RegisterSchema,
} from '@logistica/shared';
import type { IncomingHttpHeaders } from 'node:http';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_REGISTER_THROTTLE,
} from './authentication-throttling.config';
import { AuthenticationService } from './application/authentication.service';
import { getAuthenticationConfiguration } from './cookies/authentication-cookie.config';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type {
  AuthenticatedAccount,
  AuthRequestContext,
  RefreshCookieConfiguration,
  RefreshCookieOptions,
} from './types/authentication.types';

interface HttpRequest {
  ip?: string | null;
  headers: IncomingHttpHeaders;
  cookies?: Record<string, string | undefined>;
}

interface HttpResponse {
  cookie(name: string, value: string, options?: RefreshCookieOptions): unknown;
  clearCookie(name: string, options?: RefreshCookieOptions): unknown;
}

interface AuthenticatedHttpRequest extends HttpRequest {
  user: AuthenticatedAccount;
}

@Controller('auth')
export class AuthenticationController {
  private readonly refreshCookie: RefreshCookieConfiguration;

  constructor(
    private readonly authenticationService: AuthenticationService,
    configService: ConfigService,
  ) {
    this.refreshCookie =
      getAuthenticationConfiguration(configService).refreshCookie;
  }

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  @Throttle(AUTH_REGISTER_THROTTLE)
  async register(
    @Body(new ZodValidationPipe(RegisterSchema))
    registerDto: RegisterDto,
  ): Promise<IRegisterResponse> {
    return this.authenticationService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  @Throttle(AUTH_LOGIN_THROTTLE)
  async login(
    @Body(new ZodValidationPipe(LoginSchema))
    loginDto: LoginDto,
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<ILoginResponse> {
    const loginResult = await this.authenticationService.login(
      loginDto,
      this.getRequestContext(request),
    );

    this.setRefreshCookie(response, loginResult.refreshToken);

    return loginResult.response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthenticatedHttpRequest): Promise<IMeResponse> {
    return this.authenticationService.getCurrentAccount(request.user.accountId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<IRefreshResponse> {
    try {
      const refreshResult = await this.authenticationService.refresh(
        this.extractRefreshToken(request),
        this.getRequestContext(request),
      );

      this.setRefreshCookie(response, refreshResult.refreshToken);

      return refreshResult.response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.clearRefreshCookie(response);
      }

      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<void> {
    await this.authenticationService.logout(this.extractRefreshToken(request));
    this.clearRefreshCookie(response);
  }

  private getRequestContext(request: HttpRequest): AuthRequestContext {
    const userAgentHeader = request.headers['user-agent'];

    return {
      ipAddress: request.ip ?? null,
      userAgent:
        typeof userAgentHeader === 'string'
          ? userAgentHeader
          : (userAgentHeader?.[0] ?? null),
    };
  }

  private extractRefreshToken(request: HttpRequest): string | null {
    const cookieName = this.refreshCookie.name;
    const parsedCookie = request.cookies?.[cookieName];

    if (typeof parsedCookie === 'string' && parsedCookie.length > 0) {
      return parsedCookie;
    }

    const rawCookieHeader = request.headers.cookie;
    const rawCookieValue =
      typeof rawCookieHeader === 'string' ? rawCookieHeader : null;

    if (!rawCookieValue) {
      return null;
    }

    const cookiePair = rawCookieValue
      .split(';')
      .map((cookiePart: string) => cookiePart.trim())
      .find((cookiePart: string) => cookiePart.startsWith(`${cookieName}=`));

    if (!cookiePair) {
      return null;
    }

    return decodeURIComponent(cookiePair.slice(cookieName.length + 1));
  }

  private setRefreshCookie(response: HttpResponse, refreshToken: string): void {
    response.cookie(
      this.refreshCookie.name,
      refreshToken,
      this.refreshCookie.setOptions,
    );
  }

  private clearRefreshCookie(response: HttpResponse): void {
    response.clearCookie(
      this.refreshCookie.name,
      this.refreshCookie.clearOptions,
    );
  }
}
