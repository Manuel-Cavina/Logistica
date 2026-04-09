import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTrailerSchema, UpdateTrailerSchema } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { TrailerService } from './application/trailer.service';
import type { CreateTrailerDto } from './dto/create-trailer.dto';
import type {
  TrailerParamsDto,
  UpdateTrailerDto,
} from './dto/update-trailer.dto';
import { TrailerParamsSchema } from './dto/update-trailer.dto';
import type { TrailerResponseDto } from './dto/trailer.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('trailers')
export class TrailerController {
  constructor(private readonly trailerService: TrailerService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async listOwnTrailers(
    @Req() request: AuthenticatedHttpRequest,
  ): Promise<TrailerResponseDto[]> {
    return this.trailerService.listOwnTrailers(request.user.accountId);
  }

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async updateOwnTrailer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TrailerParamsSchema))
    params: TrailerParamsDto,
    @Body(new ZodValidationPipe(UpdateTrailerSchema))
    updateTrailerDto: UpdateTrailerDto,
  ): Promise<TrailerResponseDto> {
    return this.trailerService.updateOwnTrailer(
      request.user.accountId,
      params.id,
      updateTrailerDto,
    );
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async deactivateOwnTrailer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TrailerParamsSchema))
    params: TrailerParamsDto,
  ): Promise<TrailerResponseDto> {
    return this.trailerService.deactivateOwnTrailer(
      request.user.accountId,
      params.id,
    );
  }
}
