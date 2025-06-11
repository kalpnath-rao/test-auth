import { Injectable } from '@nestjs/common';
import { AccountDocument, Account } from '../schemas/account.schema';
import { SessionService } from '@api/session';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProducerService } from '@kafka/index';
import { ApiException } from '@api/api.exception';
import { mfaUtil } from '@utils/mfa.util';
import { CacheService } from '@shared/cache';
import { VerifyMFAPayloadDto, VerifyMFAResultDto } from '../dto/verify-mfa.dto';
import { AppLogger } from '@app/shared/logger';
import { ToggleMfaDto } from '../dto/mfa-toggle.dto';
import { EnvService } from '@app/shared/env';

@Injectable()
export class AccountMfaService {
  constructor(
    @InjectModel(Account.name) private $AccountModel: Model<AccountDocument>,
    private $logger: AppLogger,
    private $sessionService: SessionService,
    private readonly $producerService: ProducerService,
    private $cacheService: CacheService,
    private $env: EnvService,
  ) {}

  async verifyMFA(
    payload: VerifyMFAPayloadDto,
    _id: string,
  ): Promise<VerifyMFAResultDto> {
    if (payload.secret && !payload.platform) {
      ApiException.unAuthorized('ACCOUNT.WRONG_MFA_TOKEN');
    }
    const acc = await this.$AccountModel
      .findById(_id, {
        blockedAt: 1,
        totp: 1,
      })
      .lean();

    if (!acc) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }
    if (acc.blockedAt) {
      ApiException.badData('ACCOUNT.BLOCKED');
    }
    const secret = payload.secret ?? acc.totp?.secret;
    if (!secret) {
      ApiException.unAuthorized('ACCOUNT.WRONG_MFA_TOKEN');
    }
    let result;
    if (payload.otp !== this.$env.OTP_BYPASS) {
      result = mfaUtil.verify(payload.otp, secret);
      if (!result) {
        ApiException.badData('ACCOUNT.WRONG_MFA_OTP');
      }
    }
    if (!acc.totp && payload.secret) {
      await this.$AccountModel.updateOne(
        { _id },
        {
          $set: {
            totp: {
              platform: payload.platform,
              secret,
            },
            isMfaVerified: true,
          },
        },
      );
    }

    this.$producerService.UpdateAdminLastLoginTime({
      _id: _id,
      lastLogin: new Date(),
      isMFASetup: true,
    });

    return await this.$sessionService.create({
      type: payload.type,
      id: _id,
    });
  }

  async resetMfa(id: string): Promise<void> {
    const blockedAt = new Date();
    const admin = await this.$AccountModel.findByIdAndUpdate(
      {
        _id: id,
      },
      { $unset: { totp: 1 }, isMfaVerified: false },
      { new: true },
    );
    if (admin) {
      await this.$cacheService.expireAccount(id, blockedAt);
      this.$producerService.ResetMFA({
        id: admin._id.toHexString(),
        isMFASetup: false,
      });
    }
  }

  /**
   * Toggles MFA for a given user.
   * @param toggleMfaDto The dto containing the toggle state.
   * @param _id The id of the user to toggle MFA for.
   * @returns A promise that resolves when the user's MFA has been toggled.
   */
  async toggleMfa(toggleMfaDto: ToggleMfaDto, _id: string): Promise<void> {
    await this.$AccountModel
      .updateOne(
        { _id: new Types.ObjectId(_id) },
        { mfaToggleEnable: toggleMfaDto.enabled },
      )
      .exec();
    await this.$producerService.updateAccount({
      _id: _id,
      mfaToggleEnable: toggleMfaDto.enabled,
    });
  }
}
