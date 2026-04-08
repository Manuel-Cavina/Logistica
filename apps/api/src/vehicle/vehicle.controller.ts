import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateVehicleSchema, UpdateVehicleSchema } from '@logistica/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Roles } from '../identity/authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../identity/authentication/types/authentication.types';
import { VehicleService } from './application/vehicle.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type {
  UpdateVehicleDto,
  VehicleParamsDto,
} from './dto/update-vehicle.dto';
import { VehicleParamsSchema } from './dto/update-vehicle.dto';
import type { VehicleResponseDto } from './dto/vehicle.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async createOwnVehicle(
    @Req() request: AuthenticatedHttpRequest,
    @Body(new ZodValidationPipe(CreateVehicleSchema))
    createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.createOwnVehicle(
      request.user.accountId,
      createVehicleDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async updateOwnVehicle(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(VehicleParamsSchema))
    params: VehicleParamsDto,
    @Body(new ZodValidationPipe(UpdateVehicleSchema))
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.updateOwnVehicle(
      request.user.accountId,
      params.id,
      updateVehicleDto,
    );
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async deactivateOwnVehicle(
    @Req() request: AuthenticatedHttpRequest,
    @Param(new ZodValidationPipe(VehicleParamsSchema))
    params: VehicleParamsDto,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.deactivateOwnVehicle(
      request.user.accountId,
      params.id,
    );
  }
}
