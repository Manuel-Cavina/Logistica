import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBookingSchema } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { BookingService } from './application/booking.service';
import type { BookingDetailResponseDto } from './dto/booking-detail.response.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { BookingParamsDto } from './dto/get-booking.dto';
import { BookingParamsSchema } from './dto/get-booking.dto';
import type { BookingResponseDto } from './dto/booking.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  async getOwnBookingById(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(BookingParamsSchema))
    params: BookingParamsDto,
  ): Promise<BookingDetailResponseDto> {
    return this.bookingService.getOwnBookingById(
      request.user.accountId,
      params.id,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  async createBooking(
    @Req() request: AuthenticatedHttpRequest,
    @Body(new ZodValidationPipe(CreateBookingSchema))
    createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(
      request.user.accountId,
      createBookingDto,
    );
  }
}
