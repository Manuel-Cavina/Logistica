import { Injectable } from '@nestjs/common';
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
    return this.accountsRepository.createTransporterAccount(input);
  }
}
