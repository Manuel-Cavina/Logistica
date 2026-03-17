import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { AccountsService } from './accounts.service';

@Module({
  imports: [PrismaModule],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
