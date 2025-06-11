import { Injectable } from '@nestjs/common';
import { AccountDocument, Account } from '../schemas/account.schema';
import { SessionService } from '@api/session';
import { InjectModel } from '@nestjs/mongoose';
import { NextStep } from '../enum/auth.enum';
import { FilterQuery, Model } from 'mongoose';
import { ProducerService } from '@kafka/index';
import { ApiException } from '@api/api.exception';
import { SocialPayloadDto } from '../dto/social.dto';
import { AppLogger } from '@app/shared/logger';
import { GoogleAuthUtil } from '@app/shared/auth/google/google-auth.util';

@Injectable()
export class AccountSocialService {
  constructor(
    @InjectModel(Account.name) private $AccountModel: Model<AccountDocument>,
    private $logger: AppLogger,
    private $sessionService: SessionService,
    private readonly googleAuthUtil: GoogleAuthUtil,
    private readonly $producerService: ProducerService,
  ) {}

  async socialLogin(payload: SocialPayloadDto): Promise<{
    nextStep: NextStep;
    authToken?: string;
    refreshToken?: string;
    mfaToggleEnable?: boolean;
  }> {
    try {
      let account = {};
      const query: FilterQuery<Account>[] = [
        {
          social: {
            [payload.socialType]: payload.socialId,
          },
        },
      ];
      if (payload.email) {
        query.push({ email: payload.email });
      }

      if (payload.countryCode && payload.phoneNumber) {
        query.push({
          phone: { code: payload.countryCode, number: payload.phoneNumber },
        });
      }

      account = await this.$AccountModel.findOne({
        type: payload.userType,
        $or: query,
      });

      if (account) {
        if (account['blockedAt']) {
          return ApiException.badData('ACCOUNT.BLOCKED');
        }

        await this.$AccountModel.updateOne(
          {
            _id: account['_id'].toHexString(),
          },
          {
            $set: {
              [`social.${payload.socialType}`]: payload.socialId,
            },
          },
        );
      } else {
        const data = {};
        if (payload.email) {
          data['email'] = payload.email;
        }

        if (payload.countryCode && payload.phoneNumber) {
          data['phone'] = {
            code: payload.countryCode,
            number: payload.phoneNumber,
          };
        }
        if (payload.name) {
          data['name'] = {
            first: payload.name?.first,
            last: payload.name?.last,
          };
        }

        account = await this.$AccountModel.create({
          ...data,
          type: payload.userType,
          social: {
            [payload.socialType]: payload.socialId,
          },
        });

        this.$producerService.register({
          _id: account['_id'].toHexString(),
          type: account['type'],
          ...data,
        });
      }

      const session = await this.$sessionService.create({
        id: account['_id'].toHexString(),
        type: account['type'],
      });

      return { ...session, nextStep: NextStep.None };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @description Validate the google token.
   * @param token - The token to validate.
   * @param isAuthorizationCode - Whether the token is an authorization code.
   * @returns The social payload.
   */
  async validateGoogleToken(
    token: string,
    isAuthorizationCode: boolean = false,
  ): Promise<SocialPayloadDto> {
    try {
      if (isAuthorizationCode) {
        const tokens =
          await this.googleAuthUtil.exchangeAuthorizationCode(token);
        return this.googleAuthUtil.validateToken(tokens.id_token);
      } else {
        return this.googleAuthUtil.validateToken(token);
      }
    } catch (error) {
      this.$logger.error('Google token validation failed:', error);
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }
  }
}
