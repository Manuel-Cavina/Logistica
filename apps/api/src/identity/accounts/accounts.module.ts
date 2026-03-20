import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistica/database';
import { AccountsService } from './application/accounts.service';
import { AccountsRepository } from './repositories/accounts.repository';

@Module({
  imports: [PrismaModule],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService],
})
export class AccountsModule {}
