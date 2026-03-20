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
import {
  LoginSchema,
  type IMeResponse,
  RegisterSchema,
  type ILoginResponse,
  type IRefreshResponse,
  type IRegisterResponse,
} from '@logistica/shared';
import type { IncomingHttpHeaders } from 'node:http';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { getAuthConfiguration } from './auth.config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type {
  AuthenticatedAccount,
  AuthRequestContext,
  RefreshCookieConfiguration,
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

interface AuthenticatedHttpRequest extends HttpRequest {
  user: AuthenticatedAccount;
}

@Controller('auth')
export class AuthController {
  private readonly refreshCookie: RefreshCookieConfiguration;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.refreshCookie = getAuthConfiguration(configService).refreshCookie;
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthenticatedHttpRequest): Promise<IMeResponse> {
    return this.authService.getCurrentAccount(request.user.accountId);
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

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: HttpRequest,
    @Res({ passthrough: true }) response: HttpResponse,
  ): Promise<void> {
    await this.authService.logout(this.extractRefreshToken(request));
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
