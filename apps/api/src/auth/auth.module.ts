import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

@Module({
  imports: [AccountsModule],
  providers: [PasswordService, AuthService],
  exports: [PasswordService, AuthService],
})
export class AuthModule {}
