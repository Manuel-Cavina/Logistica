import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateTrailerSchema } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { TrailerService } from './application/trailer.service';
import type { CreateTrailerDto } from './dto/create-trailer.dto';
import type { TrailerResponseDto } from './dto/trailer.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('trailers')
export class TrailerController {
  constructor(private readonly trailerService: TrailerService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async createOwnTrailer(
    @Req() request: AuthenticatedHttpRequest,
    @Body(new ZodValidationPipe(CreateTrailerSchema))
    createTrailerDto: CreateTrailerDto,
  ): Promise<TrailerResponseDto> {
    return this.trailerService.createOwnTrailer(
      request.user.accountId,
      createTrailerDto,
    );
  }
}
