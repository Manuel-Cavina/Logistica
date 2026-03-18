import { Body, Controller, Post } from '@nestjs/common';
import { RegisterSchema, type IRegisterResponse } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
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
}
