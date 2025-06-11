import { Injectable } from '@nestjs/common';
import { AccountDocument, Account } from '../schemas/account.schema';
import { SessionService } from '@api/session';
import { InjectModel } from '@nestjs/mongoose';
import { NextStep, SocialType } from '../enum/auth.enum';
import { TokenService } from '@shared/token/token.service';
import { Model } from 'mongoose';
import { IAccount, ProducerService } from '@kafka/index';
import { ApiException } from '@api/api.exception';
import { CacheService } from '@shared/cache';
import { UserType } from '@app/app.constants';
import { AppLogger } from '@app/shared/logger';
import {
  OnboardingInput,
  VerifyOnboardingInput,
} from '../dto/graphql/account.input';
import {
  OnboardingResponse,
  VerifyOnboardOutput,
} from '../dto/graphql/account.output';
import { VerificationService } from '@app/api/verification/verification.service';

interface SocialAccountInfo {
  socialId?: string;
  socialType?: SocialType;
  socialTypeName?: string;
}

interface SocialAccount {
  social?: Partial<Record<SocialType, string>>;
  blockedAt?: Date;
  deletedAt?: Date;
}

@Injectable()
export class AccountAuthService {
  constructor(
    @InjectModel(Account.name) private $AccountModel: Model<AccountDocument>,
    private $logger: AppLogger,
    private $sessionService: SessionService,
    private readonly $producerService: ProducerService,
    private $cacheService: CacheService,
    private readonly $tokenService: TokenService,
    private readonly $verificationService: VerificationService,
  ) {}

  async create(payload: IAccount.Create): Promise<void> {
    try {
      await this.$AccountModel.create(payload);
      this.$cacheService.permissionStore(payload._id, payload.permissions);
    } catch (err) {
      throw err;
    }
  }

  async createSubAdminAccount(payload: IAccount.SubAdmin): Promise<void> {
    try {
      await this.$AccountModel.create(payload);
      this.$producerService.welcomeAdminMail({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      this.$cacheService.permissionStore(payload._id, payload.permissions);
    } catch (err) {
      throw err;
    }
  }

  async update({ _id, blockedAt, ...changes }: IAccount.Update): Promise<void> {
    const update: Record<string, object> = {
      $set: changes,
    };
    if (blockedAt === null) {
      update.$unset = {
        blockedAt: '',
      };
    } else if (blockedAt) {
      update.$set = { ...(update.$set ?? {}), blockedAt };
    }
    await this.$AccountModel.updateOne({ _id }, update);
  }

  async delete(_id: string): Promise<void> {
    await this.$AccountModel.updateOne(
      { _id },
      { $set: { deletedAt: new Date() } },
    );
  }

  /**
   * @description Checks if an email is available for registration
   * @param email - The email to check
   * @returns Object containing availability status and any existing account info
   * @throws ApiException if email format is invalid or email is already registered
   */
  async checkEmailStatus(email: string): Promise<{
    exists: boolean;
    isBlocked: boolean;
    deletedAt: boolean;
    socialId?: string;
    socialType?: string;
    socialTypeName?: string;
  }> {
    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const account = await this.$AccountModel
        .findOne(
          { email: sanitizedEmail },
          { blockedAt: 1, social: 1, deletedAt: 1, _id: 0 },
        )
        .hint({ email: 1 })
        .lean();

      // If account doesn't exist, return available status
      if (!account) {
        return {
          exists: false,
          isBlocked: false,
          deletedAt: false,
        };
      }

      if (account.blockedAt) {
        return {
          exists: true,
          isBlocked: true,
          deletedAt: false,
        };
      }

      // If account exists and is not deleted
      if (account && !account.deletedAt) {
        const socialInfo = this.handleSocialAccount(account);
        if (socialInfo.socialTypeName) {
          return {
            exists: true,
            isBlocked: false,
            deletedAt: false,
            ...socialInfo,
          };
        }

        return {
          exists: true,
          isBlocked: false,
          deletedAt: false,
        };
      }

      // Account exists but is deleted
      return {
        exists: true,
        isBlocked: false,
        deletedAt: true,
      };
    } catch (error) {
      this.$logger.error(
        `Error checking email status for ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private handleSocialAccount(
    account: Account | SocialAccount,
  ): SocialAccountInfo {
    try {
      if (account.social && Object.keys(account.social).length > 0) {
        const socialEntries = Object.entries(account.social) as [
          SocialType,
          string,
        ][];
        if (socialEntries.length > 0) {
          const [socialType, socialId] = socialEntries[0];
          const socialTypeName = Object.keys(SocialType).find(
            (key) => SocialType[key] === socialType,
          );

          if (socialTypeName) {
            return { socialId, socialType, socialTypeName };
          }
        }
      }
      return {};
    } catch (error) {
      this.$logger.error(
        `Error handling social account: ${error.message}`,
        error.stack,
      );
      return {};
    }
  }

  /**
   * @description Onboards a user with email and password
   * @param input - The input payload containing the email and password
   * @returns The onboarding response with MFA token
   * @throws ApiException if account already exists or is blocked
   */
  async onboarding(input: OnboardingInput): Promise<OnboardingResponse> {
    //use try catch to handle any errors and logger where appropriate
    const sanitizedEmail = input.email.toLowerCase().trim();
    try {
      this.$logger.debug('Onboarding user with email and password');
      // Validate email
      const emailStatus = await this.checkEmailStatus(sanitizedEmail);
      // Check if account is blocked
      if (emailStatus?.isBlocked) {
        ApiException.badData('ACCOUNT.BLOCKED');
      }
      // If account exists and is not deleted
      if (emailStatus?.exists && !emailStatus.deletedAt) {
        // Check if it's a social account
        if (emailStatus.socialId && emailStatus.socialType) {
          if (emailStatus.socialTypeName) {
            ApiException.badDataWith(
              {
                SOCIAL_NAME: emailStatus.socialTypeName,
              },
              'ACCOUNT.EMAIL_ALREADY_EXISTS_SOCIAL',
            );
          }
        }

        // If not a social account or social data is invalid, throw error for existing email
        ApiException.badData('ACCOUNT.EMAIL_ALREADY_EXISTS');
      }
      // Generate MFA token for new registration
      const mfaPayload = {
        aid: '',
        tid: Date.now(),
        typ: UserType.User,
        email: sanitizedEmail,
        password: input.password,
      };
      //generate mfa token for the user
      const mfaToken = this.$tokenService.genMFAToken(mfaPayload);
      // Send email verification
      await this.$verificationService.sendMail(sanitizedEmail, 'User');

      return {
        success: true,
        mfaToken,
      };
    } catch (error) {
      this.$logger.error(
        `Error during onboarding for email ${sanitizedEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * @description Verify the otp of the user.
   * @param input - The input payload containing the otp.
   * @param user - The user payload containing the email and password.
   * @returns The verify email response.
   */
  async verifyEmail(
    input: VerifyOnboardingInput,
    user: IUser,
  ): Promise<VerifyOnboardOutput> {
    try {
      this.$logger.debug('Verifying user email with OTP');
      await this.$verificationService.verifyOtp({
        email: user.email,
        otp: input.otp,
      });

      const account = await this.$AccountModel.create({
        email: user.email,
        password: user.password, // Let Mongoose pre-save hook handle the hashing
        type: user.type,
        isEmailVerified: true,
      });

      this.$producerService.register({
        _id: account._id.toHexString(),
        type: account.type,
        email: account.email,
        isRoot: false,
      });

      this.$producerService.welcomeMail({
        email: account.email,
      });

      const session = await this.$sessionService.create({
        id: account._id.toHexString(),
        type: account.type,
      });

      return {
        success: true,
        nextStep: NextStep.None,
        ...session,
      };
    } catch (error) {
      this.$logger.error(
        `Error verifying email for user ${user.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
