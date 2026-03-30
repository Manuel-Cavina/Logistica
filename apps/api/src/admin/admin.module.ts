import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { AdminService } from './application/admin.service';
import { AdminController } from './admin.controller';
import { AdminTransporterRepository } from './repositories/admin-transporter.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminTransporterRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AdminModule {}
