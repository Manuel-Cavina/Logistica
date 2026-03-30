import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { TransporterProfileService } from './application/transporter-profile.service';
import { TransporterProfileRepository } from './repositories/transporter-profile.repository';
import { TransporterProfileController } from './transporter-profile.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TransporterProfileController],
  providers: [
    TransporterProfileService,
    TransporterProfileRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [TransporterProfileService],
})
export class TransporterProfileModule {}
