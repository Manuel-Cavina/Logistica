import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  UpdateTransporterProfileSchema,
  type UpdateTransporterProfileDto,
} from '@logistica/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../authentication/decorators/roles.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import type { AuthenticatedAccount } from '../authentication/types/authentication.types';
import { TransporterProfileService } from './application/transporter-profile.service';
import type { GetOwnTransporterProfileResponseDto } from './dto/get-own-transporter-profile.response.dto';

interface AuthenticatedHttpRequest {
  user: AuthenticatedAccount;
}

@Controller('transporter')
export class TransporterProfileController {
  constructor(
    private readonly transporterProfileService: TransporterProfileService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async getOwnProfile(
    @Req() request: AuthenticatedHttpRequest,
  ): Promise<GetOwnTransporterProfileResponseDto> {
    return this.transporterProfileService.getOwnProfile(request.user.accountId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRANSPORTER')
  async updateOwnProfile(
    @Req() request: AuthenticatedHttpRequest,
    @Body(new ZodValidationPipe(UpdateTransporterProfileSchema))
    updateTransporterProfileDto: UpdateTransporterProfileDto,
  ): Promise<GetOwnTransporterProfileResponseDto> {
    return this.transporterProfileService.updateOwnProfile(
      request.user.accountId,
      updateTransporterProfileDto,
    );
  }
}
