import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { AdminService } from './application/admin.service';
import { AdminTransporterDetailResponseDto } from './dto/admin-transporter-detail.response.dto';
import { AdminTransporterListItemResponseDto } from './dto/admin-transporter-list-item.response.dto';
import {
  GetAdminTransporterParamsSchema,
  GetAdminTransportersQuerySchema,
  type GetAdminTransporterParamsDto,
  type GetAdminTransportersQueryDto,
} from './dto/get-admin-transporters.query.dto';

@Controller('admin/transporters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listTransporters(
    @Query(new ZodValidationPipe(GetAdminTransportersQuerySchema))
    query: GetAdminTransportersQueryDto,
  ): Promise<AdminTransporterListItemResponseDto[]> {
    return this.adminService.listTransporters(query);
  }

  @Get(':id')
  async getTransporterDetail(
    @Param(new ZodValidationPipe(GetAdminTransporterParamsSchema))
    params: GetAdminTransporterParamsDto,
  ): Promise<AdminTransporterDetailResponseDto> {
    return this.adminService.getTransporterDetail(params.id);
  }
}
