import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTripOfferSchema,
  UpdateTripOfferSchema,
} from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { TripOfferService } from './application/trip-offer.service';
import type { CreateTripOfferDto } from './dto/create-trip-offer.dto';
import type {
  TripOfferParamsDto,
  UpdateTripOfferDto,
} from './dto/update-trip-offer.dto';
import { TripOfferParamsSchema } from './dto/update-trip-offer.dto';
import type { TripOfferResponseDto } from './dto/trip-offer.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('trip-offers')
export class TripOfferController {
  constructor(private readonly tripOfferService: TripOfferService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async listOwnTripOffers(
    @Req() request: AuthenticatedHttpRequest,
  ): Promise<TripOfferResponseDto[]> {
    return this.tripOfferService.listOwnTripOffers(request.user.accountId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async createOwnTripOffer(
    @Req() request: AuthenticatedHttpRequest,
    @Body(new ZodValidationPipe(CreateTripOfferSchema))
    createTripOfferDto: CreateTripOfferDto,
  ): Promise<TripOfferResponseDto> {
    return this.tripOfferService.createOwnTripOffer(
      request.user.accountId,
      createTripOfferDto,
    );
  }

  @Post(':id/publish')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async publishOwnTripOffer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TripOfferParamsSchema))
    params: TripOfferParamsDto,
  ): Promise<TripOfferResponseDto> {
    return this.tripOfferService.publishOwnTripOffer(
      request.user.accountId,
      params.id,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async updateOwnTripOffer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TripOfferParamsSchema))
    params: TripOfferParamsDto,
    @Body(new ZodValidationPipe(UpdateTripOfferSchema))
    updateTripOfferDto: UpdateTripOfferDto,
  ): Promise<TripOfferResponseDto> {
    return this.tripOfferService.updateOwnTripOffer(
      request.user.accountId,
      params.id,
      updateTripOfferDto,
    );
  }

  @Post(':id/close')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async closeOwnTripOffer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TripOfferParamsSchema))
    params: TripOfferParamsDto,
  ): Promise<TripOfferResponseDto> {
    return this.tripOfferService.closeOwnTripOffer(
      request.user.accountId,
      params.id,
    );
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async cancelOwnTripOffer(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(TripOfferParamsSchema))
    params: TripOfferParamsDto,
  ): Promise<TripOfferResponseDto> {
    return this.tripOfferService.cancelOwnTripOffer(
      request.user.accountId,
      params.id,
    );
  }
}
