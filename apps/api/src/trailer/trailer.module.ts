import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { TrailerService } from './application/trailer.service';
import { TrailerController } from './trailer.controller';
import { TrailerRepository } from './repositories/trailer.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TrailerController],
  providers: [TrailerService, TrailerRepository, JwtAuthGuard, RolesGuard],
  exports: [TrailerService],
})
export class TrailerModule {}
