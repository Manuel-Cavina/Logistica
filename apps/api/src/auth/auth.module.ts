import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

@Module({
  imports: [AccountsModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService],
  exports: [PasswordService],
})
export class AuthModule {}
