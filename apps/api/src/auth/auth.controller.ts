import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LoginSchema,
  RegisterSchema,
  type ILoginResponse,
  type IRefreshResponse,
  type IRegisterResponse,
} from '@logistica/shared';
import type { IncomingHttpHeaders } from 'node:http';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { getAuthConfiguration } from './auth.config';
import { AuthService } from './auth.service';
import type {
  AuthConfiguration,
  AuthRequestContext,
  RefreshCookieOptions,
} from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

interface HttpRequest {
  ip?: string | null;
  headers: IncomingHttpHeaders;
  cookies?: Record<string, string | undefined>;
}

interface HttpResponse {
  cookie(name: string, value: string, options?: RefreshCookieOptions): unknown;
  clearCookie(name: string, options?: RefreshCookieOptions): unknown;
}

@Controller('auth')
export class AuthController {
  private readonly authConfig: AuthConfiguration;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.authConfig = getAuthConfiguration(configService);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema))
    registerDto: RegisterDto,
  ): Promise<IRegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema))
    loginDto: LoginDto,
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<ILoginResponse> {
    const loginResult = await this.authService.login(
      loginDto,
      this.getRequestContext(request),
    );

    this.setRefreshCookie(response, loginResult.refreshToken);

    return loginResult.response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<IRefreshResponse> {
    try {
      const refreshResult = await this.authService.refresh(
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
    const cookieName = this.authConfig.refreshCookieName;
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
      this.authConfig.refreshCookieName,
      refreshToken,
      this.authConfig.refreshCookieOptions,
    );
  }

  private clearRefreshCookie(response: HttpResponse): void {
    response.clearCookie(
      this.authConfig.refreshCookieName,
      this.authConfig.refreshCookieOptions,
    );
  }
}
