import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
    return this.transporterProfileService.getOwnProfile(
      request.user.accountId,
    );
  }
}
