import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateBookingSchema } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { BookingService } from './application/booking.service';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { BookingResponseDto } from './dto/booking.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
