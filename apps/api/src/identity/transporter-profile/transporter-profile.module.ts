import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { TransporterProfileService } from './application/transporter-profile.service';
import { TransporterProfileRepository } from './repositories/transporter-profile.repository';

@Module({
  imports: [PrismaModule],
  providers: [TransporterProfileService, TransporterProfileRepository],
  exports: [TransporterProfileService],
})
export class TransporterProfileModule {}
