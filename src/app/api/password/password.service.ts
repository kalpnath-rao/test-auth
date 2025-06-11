import { AccountService } from '@api/account';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Password, PasswordMethod } from './schema/password.schema';
import { Model, Types } from 'mongoose';
import { ApiException } from '@api/api.exception';
import { TokenService } from '@shared/token';
import { ProducerService } from '@app/kafka';
import { passwordUtil } from '@utils/password.util';
import { QueryResult } from './interfaces/reset';
import { CacheService } from '@shared/cache';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as moment from 'moment-timezone';
import { MAX_ATTEMPTS } from './constants/password.constants';
import { SetPasswordDto } from './dto/set-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { VerificationService } from '../verification';

@Injectable()
export class PasswordService {
  get model(): string {
    return this.$PasswordModel.modelName;
  }
  constructor(
    private $tokenService: TokenService,
    private $cacheService: CacheService,
    private $accountService: AccountService,
    private $producerService: ProducerService,
    @InjectModel(Password.name) private $PasswordModel: Model<Password>,
    private readonly $verificationService: VerificationService,
  ) {}
  async forget(email: string): Promise<void> {
    const account = await this.$accountService.findByEmail(email);
    if (!account.password) {
      ApiException.badData('ACCOUNT.PASSWORD_NOT_FOUND');
    }
    if (!account) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    if (account.blockedAt) {
      ApiException.badData('ACCOUNT.BLOCKED');
    }
    // Timezone should pick from headers.
    const date = moment().tz('Asia/Kolkata');
    const start = date.startOf('day').toDate();
    const end = date.endOf('day').toDate();
    const attempt_count = await this.$PasswordModel
      .find({
        account: account._id,
        createdAt: { $gte: start, $lte: end },
      })
      .countDocuments();
    if (attempt_count >= MAX_ATTEMPTS.RESET) {
      ApiException.badData('PASSWORD.FORGET_PASS_REQ_LIMIT');
    }
    const req = await this.$PasswordModel.create({
      account: account._id,
      method: PasswordMethod.Reset,
    });
    const token = this.$tokenService.genPasswordToken({
      tid: req._id.toHexString(),
      aid: account._id,
      typ: account.type,
    });

    const {
      type,
      name: { first, last },
    } = account;
    this.$producerService.forgetPassword({
      token,
      type,
      email,
      name: `${first} ${last}`,
    });
  }
  async reset(password: string, requestId: string): Promise<void> {
    const _id = new Types.ObjectId(requestId);
    const [req] = await this.$PasswordModel.aggregate<QueryResult>([
      { $match: { _id } },
      {
        $lookup: {
          from: this.model,
          localField: 'account',
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
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $limit: 5,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'account',
        },
      },
      {
        $project: {
          accountId: 1,
          oldPassword: 1,
          account: {
            $first: '$account',
          },
          passwords: {
            $map: {
              input: '$passwords',
              as: 'pwd',
              in: '$$pwd.oldPassword',
            },
          },
        },
      },
    ]);
    if (!req) {
      ApiException.badData('PASSWORD.NO_REQUEST');
    } else if (req.oldPassword) {
      ApiException.badData('PASSWORD.LINK_EXPIRED');
    }
    if (!req.account) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    } else if (req.account.blockedAt) {
      ApiException.badData('ACCOUNT.BLOCKED');
    }
    if (await passwordUtil.compare(password, req.account.password)) {
      ApiException.badData('PASSWORD.USED_PWD');
    }
    if (req.passwords?.length) {
      const matched = await Promise.all(
        req.passwords.map(async (hash) => {
          return await passwordUtil.compare(password, hash);
        }),
      );
      if (matched.some((isMatched) => isMatched)) {
        ApiException.badData('PASSWORD.USED_PWD');
      }
    }
    try {
      const { password: oldPassword, name, type } = req.account;
      await Promise.all([
        this.$accountService.changePassword(password, req.account._id),
        this.$PasswordModel.updateOne({ _id }, { oldPassword }).exec(),
      ]);

      const { email } = await this.$accountService.findById(
        req.account._id.toHexString(),
      );

      this.$producerService.changePassword({
        type: type,
        name: `${name?.first} ${name?.last}`,
        email: email,
      });
      await this.$cacheService.expireAccount(req.account._id.toHexString());
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async change(payload: ChangePasswordDto, account: string): Promise<void> {
    const result = await this.$accountService.passwords(account);
    if (!result) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    if (await passwordUtil.misMatch(payload.currentPassword, result.password)) {
      ApiException.badData('PASSWORD.MIS_MATCH');
    }
    if (result.passwords?.length) {
      const matched = await Promise.all(
        result.passwords.map(async (hash) => {
          return await passwordUtil.compare(payload.newPassword, hash);
        }),
      );
      if (matched.some((isMatched) => isMatched)) {
        ApiException.badData('PASSWORD.USED_PWD');
      }
    }
    try {
      await this.$accountService.changePassword(
        payload.newPassword,
        result._id,
      );
      await this.$PasswordModel.create({
        account: result._id,
        oldPassword: result.password,
        method: PasswordMethod.Change,
      });
      const { type, name } = result;
      const { email } = await this.$accountService.findById(
        result._id.toHexString(),
      );
      this.$producerService.changePassword({
        type,
        name: `${name.first} ${name.last}`,
        email: email,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async setFreshPassword(
    payload: SetPasswordDto,
    account: string,
  ): Promise<void> {
    const result = await this.$accountService.findById(account);
    if (!result) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    try {
      await this.$accountService.setPassword(payload.password, result._id);
      const { type, name } = result;
      this.$producerService.setPassword({
        type,
        name: `${name.first} ${name.last}`,
        email: result.email,
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async verify(payload: VerifyPasswordDto, account: string): Promise<void> {
    try {
      const result = await this.$accountService.passwords(account);
      if (!result) {
        ApiException.badData('ACCOUNT.NOT_FOUND');
      }
      if (
        await passwordUtil.misMatch(payload.currentPassword, result.password)
      ) {
        ApiException.badData('PASSWORD.MIS_MATCH');
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
