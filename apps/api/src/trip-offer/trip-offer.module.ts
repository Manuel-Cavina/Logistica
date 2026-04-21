import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { TripOfferService } from './application/trip-offer.service';
import { TripOfferController } from './trip-offer.controller';
import { TripOfferRepository } from './repositories/trip-offer.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TripOfferController],
  providers: [TripOfferService, TripOfferRepository, JwtAuthGuard, RolesGuard],
})
export class TripOfferModule {}
