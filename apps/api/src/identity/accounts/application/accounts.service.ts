import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AccountRole } from '@logistica/database';
import type {
  AccountWithProfiles,
  CreateClientAccountInput,
  CreateTransporterAccountInput,
} from '../types/accounts.types';
import { AccountsRepository } from '../repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async findByEmail(email: string): Promise<AccountWithProfiles | null> {
    return this.accountsRepository.findByEmail(email);
  }

  async findById(id: string): Promise<AccountWithProfiles | null> {
    return this.accountsRepository.findById(id);
  }

  async createClientAccount(
    input: CreateClientAccountInput,
  ): Promise<AccountWithProfiles> {
    return this.accountsRepository.createClientAccount(input);
  }

  async createTransporterAccount(
    input: CreateTransporterAccountInput,
  ): Promise<AccountWithProfiles> {
    const account = await this.accountsRepository.createTransporterAccount(input);

    if (
      account.role !== AccountRole.TRANSPORTER ||
      !account.transporterProfile
    ) {
      throw new InternalServerErrorException(
        'Transporter account creation must include a base transporter profile.',
      );
    }

    return account;
  }
}
