import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { VehicleService } from './application/vehicle.service';
import { VehicleController } from './vehicle.controller';
import { VehicleRepository } from './repositories/vehicle.repository';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository, JwtAuthGuard, RolesGuard],
  exports: [VehicleService],
})
export class VehicleModule {}
