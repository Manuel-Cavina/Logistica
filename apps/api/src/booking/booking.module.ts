import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { BookingService } from './application/booking.service';
import { BookingController } from './booking.controller';
import { BookingRepository } from './repositories/booking.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, JwtAuthGuard, RolesGuard],
})
export class BookingModule {}
