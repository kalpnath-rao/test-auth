import { Inject, Injectable } from '@nestjs/common';
import {
  AdminKey,
  UserKey,
  KAFKA_PRODUCER,
  KafkaTopic,
  MailKey,
  SmsKey,
  AccountKey,
} from './kafka.constants';
import {
  IAccountMap,
  IAdminMap,
  IUser,
  IUserMap,
  ISmsMap,
  IMail,
  IMailMap,
  IAdmin,
} from './kafka.types';
import { Producer, RecordMetadata } from 'kafkajs';
import { UserType } from '@app/app.constants';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ProducerService {
  constructor(
    private $cls: ClsService,
    @Inject(KAFKA_PRODUCER) private $producer: Producer,
  ) {}

  async welcomeAdminMail(
    message: IMail.WelcomeAdmin,
  ): Promise<RecordMetadata[]> {
    return await this.toMail(MailKey.WelcomeAdmin, message);
  }

  async updateIsMfaVerified(
    message: IAdmin.updateMfaVerified,
  ): Promise<RecordMetadata[]> {
    return await this.toAdmin(AdminKey.updateMfaVerified, message);
  }

  async UpdateAdminLastLoginTime(
    message: IAdmin.UpdateLastLogin,
  ): Promise<RecordMetadata[]> {
    return await this.toAdmin(AdminKey.UpdateLastLogin, message);
  }

  async register({
    type,
    ...message
  }: Record<string, unknown>): Promise<RecordMetadata[]> {
    if (type === UserType.User) {
      return this.toUser(UserKey.Create, message);
    }
  }

  async userSignUp(message: IUser.SignUp): Promise<RecordMetadata[]> {
    return await this.toUser(UserKey.SignUp, message);
  }

  async validateUserEmail(
    message: IMail.validateUserEmail,
  ): Promise<RecordMetadata[]> {
    return await this.toMail(MailKey.validateUser, message);
  }

  async ResetMFA(message: IAdmin.ResetMFA): Promise<RecordMetadata[]> {
    return await this.toAdmin(AdminKey.ResetMFA, message);
  }

  async send(
    topic: string,
    key: string,
    message: object,
  ): Promise<RecordMetadata[]> {
    const correlationId = this.$cls.get('CORRELATION_ID');
    const value = JSON.stringify({ ...message, correlationId });
    return await this.$producer.send({
      topic,
      messages: [{ key, value }],
    });
  }

  async toAccount<K extends keyof IAccountMap>(
    key: K,
    message: IAccountMap[K],
  ): Promise<RecordMetadata[]> {
    return await this.send(KafkaTopic.Account, key, message);
  }

  async toUser<K extends keyof IUserMap>(
    key: K,
    message: IUserMap[K],
  ): Promise<RecordMetadata[]> {
    return await this.send(KafkaTopic.User, key, message);
  }

  async toAdmin<K extends keyof IAdminMap>(
    key: K,
    message: IAdminMap[K],
  ): Promise<RecordMetadata[]> {
    return await this.send(KafkaTopic.Admin, key, message);
  }

  async toMail<K extends keyof IMailMap>(
    key: K,
    message: IMailMap[K],
  ): Promise<RecordMetadata[]> {
    return await this.send(KafkaTopic.Mail, key, message);
  }

  async toSms<K extends keyof ISmsMap>(
    key: K,
    message: ISmsMap[K],
  ): Promise<RecordMetadata[]> {
    return await this.send(KafkaTopic.Sms, key, message);
  }

  forgetPassword(message: IMail.ForgetPassword): Promise<RecordMetadata[]> {
    return this.toMail(MailKey.ForgetPassword, message);
  }

  changePassword(message: IMail.ChangePassword): Promise<RecordMetadata[]> {
    return this.toMail(MailKey.ChangePassword, message);
  }

  setPassword(message: IMail.SetPassword): Promise<RecordMetadata[]> {
    return this.toMail(MailKey.SetPassword, message);
  }

  verifyAccount(
    message: Record<string, string>,
    channel: 'Mail' | 'SMS',
  ): Promise<RecordMetadata[]> {
    if (channel === 'Mail') {
      return this.toMail(MailKey.VerifyAccount, message);
    } else if (channel === 'SMS') {
      return this.toSms(SmsKey.VerifyAccount, message);
    }
  }

  UpdateUserLastLoginTime(
    message: Record<string, unknown>,
  ): Promise<RecordMetadata[]> {
    return this.toUser(UserKey.LastLoginAt, message);
  }

  registerSettings(
    message: Record<string, unknown>,
  ): Promise<RecordMetadata[]> {
    return this.toUser(UserKey.RegisterSetting, message);
  }

  StoreCustomerDeviceToken(
    message: Record<string, unknown>,
  ): Promise<RecordMetadata[]> {
    return this.toUser(UserKey.StoreDeviceToken, message);
  }

  SyncPlatform(message: Record<string, unknown>): Promise<RecordMetadata[]> {
    return this.toUser(UserKey.SyncPlatform, message);
  }

  logout(message: Record<string, unknown>): Promise<RecordMetadata[]> {
    return this.toAccount(AccountKey.Logout, message);
  }

  updateAccount({
    ...message
  }: Record<string, unknown>): Promise<RecordMetadata[]> {
    return this.toUser(UserKey.Update, message);
  }

  welcomeMail(message: IMail.WelcomeUser): Promise<RecordMetadata[]> {
    return this.toMail(MailKey.WelcomeUser, message);
  }
}
