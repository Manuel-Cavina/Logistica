import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  LoginSchema,
  RegisterSchema,
  type ILoginResponse,
  type IRegisterResponse,
} from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  ): Promise<ILoginResponse> {
    return this.authService.login(loginDto);
  }
}
