import { Injectable } from '@nestjs/common';
import { AccountDocument, Account } from './schemas/account.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TokenService } from '@shared/token/token.service';
import { Model, Types } from 'mongoose';
import { IAccount, ProducerService } from '@kafka/index';
import { ApiException } from '@api/api.exception';
import { CacheService } from '@shared/cache';
import { UserType } from '@app/app.constants';
import { AccountType } from './dto/graphql/account.output';
import * as DATA from '@data/blocked-emails.json';
import { EnvService } from '@app/shared/env';

@Injectable()
export class AccountService {
  get model(): string {
    return this.$AccountModel.modelName;
  }
  constructor(
    private $cacheService: CacheService,
    private readonly $tokenService: TokenService,
    private readonly $producerService: ProducerService,
    @InjectModel(Account.name) private $AccountModel: Model<AccountDocument>,
    private $env: EnvService,
  ) {}

  async blockAccount(
    _id: Types.ObjectId,
    type: UserType,
    update?: object,
  ): Promise<void> {
    const blockedAt = new Date();
    await this.$AccountModel.updateOne(
      { _id },
      {
        $set: { blockedAt },
        ...update,
      },
    );
    await this.$cacheService.expireAccount(_id.toHexString(), blockedAt);
  }

  async findByEmail(email: string): Promise<AccountType> {
    const acc = await this.$AccountModel.findOne(
      { email },
      { _id: 1, blockedAt: 1, name: 1, type: 1, password: 1 },
    );
    if (!acc) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    const result = acc.toObject();
    return {
      _id: result._id.toHexString(),
      email: result.email,
      type: result.type,
    };
  }

  async findById(id: string): Promise<AccountDocument> {
    const acc = await this.$AccountModel.findOne({ _id: id });
    if (!acc) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    return acc.toObject();
  }

  async changePassword(password: string, _id: Types.ObjectId): Promise<void> {
    await this.$AccountModel.updateOne({ _id }, { password }).exec();
  }

  async setPassword(password: string, _id: Types.ObjectId): Promise<void> {
    await this.$AccountModel.updateOne({ _id }, { password }).exec();
  }
  async authSettings(id: string): Promise<{
    totp: {
      enabled: boolean;
      application: boolean;
    };
  }> {
    const acc = await this.$AccountModel.findById(id, {
      contact: 1,
      totp: 1,
    });
    if (!acc) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    return {
      totp: {
        enabled: !!acc.totp?.secret,
        application: !!acc.totp?.platform,
      },
    };
  }
  async permissions(_id: string): Promise<Record<string, string[]>> {
    const account = await this.$AccountModel
      .findById(_id, ['permissions', 'blockedAt'])
      .lean();
    if (!account || account.blockedAt) {
      return ApiException.unAuthorized('UnAuthorized');
    }
    return account.permissions;
  }

  async passwords(
    account: string,
  ): Promise<Account & { _id: Types.ObjectId; passwords: string[] }> {
    const [result] = await this.$AccountModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(account) } },
        {
          $lookup: {
            from: 'passwords',
            localField: '_id',
            foreignField: 'account',
            as: 'passwords',
            pipeline: [
              {
                $match: {
                  oldPassword: {
                    $exists: true,
                  },
                },
              },
              { $sort: { updatedAt: -1 } },
              { $limit: 5 },
            ],
          },
        },
        {
          $project: {
            name: 1,
            scope: 1,
            password: 1,
            passwords: {
              $map: {
                input: '$passwords',
                as: 'this',
                in: '$$this.oldPassword',
              },
            },
          },
        },
      ])
      .exec();
    return result as Account & { _id: Types.ObjectId; passwords: string[] };
  }

  async checkPasswordTokenExpireTime(token: string): Promise<AccountDocument> {
    const isValidatedToken =
      await this.$tokenService.verifyPasswordToken(token);
    if (!isValidatedToken) {
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }
    const userData = await this.$tokenService.getDataFromToken(token);
    if (!userData) {
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }

    const { name, email, password } = Object(userData);
    const type = UserType.User;

    const responseData = await this.$AccountModel.create({
      name,
      email,
      password,
      type,
    });

    await this.$AccountModel.updateOne(
      {
        _id: responseData._id,
      },
      {
        $set: {
          isEmailVerified: true,
        },
      },
    );
    this.$producerService.userSignUp({
      name,
      email,
      _id: responseData._id.toHexString(),
      isRoot: false,
    });

    return responseData;
  }

  async blockUnblockAccount(payload: IAccount.Status): Promise<void> {
    try {
      if (!payload?.blockedAt) {
        await this.$AccountModel.findOneAndUpdate(
          { _id: payload._id },
          {
            $unset: {
              blockedAt: 1,
            },
          },
        );
      } else {
        await this.$AccountModel.findOneAndUpdate(
          { _id: payload._id },
          {
            $set: {
              blockedAt: payload.blockedAt,
            },
          },
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async addPermissions(payload: {
    ids: string[];
    permissions: Record<string, string[]>;
  }): Promise<void> {
    if (payload.ids.length) {
      await this.$AccountModel.updateMany(
        { _id: { $in: payload.ids } },
        { $set: { permissions: payload.permissions } },
        { multi: true },
      );
    }
  }

  /**
   * Checks if the given email is in the list of blocked emails.
   * @param email - The email address to be checked.
   * @returns A promise that resolves to true if the email's domain is blocked, false otherwise.
   */

  async isEmailBlocked(email: string): Promise<boolean> {
    if (this.$env.ALLOWED_EMAILS.includes(email.split('@')[1])) {
      return false;
    }
    if (
      DATA.BLOCKED_EMAILS &&
      DATA.BLOCKED_EMAILS.includes(email.split('@')[1])
    ) {
      return true;
    }
  }
}
