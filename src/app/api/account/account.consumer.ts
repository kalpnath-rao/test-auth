import { Controller } from '@nestjs/common';

import {
  Consume,
  AccountKey,
  KafkaTopic,
  Subscribe,
  IAccount,
} from '@kafka/index';
import { AccountAuthService } from './services/account.auth.service';
import { AccountService } from './account.service';

@Controller()
@Consume(KafkaTopic.Account)
export class AccountConsumer {
  constructor(
    private accountAuthService: AccountAuthService,
    private accountService: AccountService,
  ) {}

  @Subscribe(AccountKey.Create)
  async create(payload: IAccount.Create): Promise<void> {
    await this.accountAuthService.create(payload);
  }

  @Subscribe(AccountKey.Subadmin)
  async createSubAdminAccount(payload: IAccount.SubAdmin): Promise<void> {
    await this.accountAuthService.createSubAdminAccount(payload);
  }

  @Subscribe(AccountKey.Update)
  async update(payload: IAccount.Update): Promise<void> {
    await this.accountAuthService.update(payload);
  }

  @Subscribe(AccountKey.Delete)
  async delete(payload: IAccount.Delete): Promise<void> {
    await this.accountAuthService.delete(payload._id);
  }

  @Subscribe(AccountKey.SyncPermission)
  async syncAccountPermissions(
    payload: IAccount.UpdatePermission,
  ): Promise<void> {
    await this.accountService.addPermissions(payload);
  }

  @Subscribe(AccountKey.Status)
  async blockUnblockAccount(payload: IAccount.Status): Promise<void> {
    await this.accountService.blockUnblockAccount(payload);
  }
}
