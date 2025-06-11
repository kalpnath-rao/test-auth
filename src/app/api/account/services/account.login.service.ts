import { Injectable } from '@nestjs/common';
import { AccountDocument, Account } from '../schemas/account.schema';
import { BLOCK_TIMES, MAX_ATTEMPTS } from '../constants/account.constants';
import { SessionService } from '@api/session';
import { LoginPayloadDto } from '../dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MFAPlatform, NextStep } from '../enum/auth.enum';
import { TokenService } from '@shared/token/token.service';
import { Model, Types } from 'mongoose';
import { ApiException } from '@api/api.exception';
import { passwordUtil } from '@utils/password.util';
import { mfaUtil } from '@utils/mfa.util';
import * as moment from 'moment-timezone';
import { UserType } from '@app/app.constants';
import { AppLogger } from '@app/shared/logger';

@Injectable()
export class AccountLoginService {
  constructor(
    @InjectModel(Account.name) private $AccountModel: Model<AccountDocument>,
    private $logger: AppLogger,
    private $sessionService: SessionService,
    private readonly $tokenService: TokenService,
  ) {}

  async login({ email, password }: LoginPayloadDto): Promise<{
    nextStep: NextStep;
    mfaToken?: string;
    qrUrl?: string;
    platform?: MFAPlatform;
    authToken?: string;
    refreshToken?: string;
    mfaToggleEnable?: boolean;
  }> {
    const sanitizedEmail = email.toLowerCase().trim();
    this.$logger.log(`Login attempt for email: ${sanitizedEmail}`);
    try {
      //validate account
      const account = await this.validateAccount(sanitizedEmail);

      // Check if the user is blocked or has exceeded the login attempts
      await this.checkLoginAttempts(account);

      // Validate password
      if (await passwordUtil.misMatch(password, account.password)) {
        // Increment login attempts if password is incorrect
        await this.incrementLoginAttempts(
          account._id,
          account.loginAttempts || 0,
        );
        const attempts = MAX_ATTEMPTS.LOGIN - account.loginAttempts - 1;
        this.$logger.log(
          `Login failed for email ${sanitizedEmail}. Attempts left: ${attempts}`,
        );
        ApiException.badData('ACCOUNT.WRONG_CREDENTIALS');
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(account._id);

      if (account.type === UserType.Admin) {
        return this.handleAdminLogin(account);
      }

      //handle successful login
      return this.handleSuccessfulLogin(account);

      //
    } catch (error) {
      this.$logger.error(
        `Error during login for email ${sanitizedEmail}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async validateAccount(email: string): Promise<AccountDocument> {
    const sanitizedEmail = email.toLowerCase().trim();
    const account = await this.$AccountModel
      .findOne(
        { email: sanitizedEmail },
        {
          password: 1,
          blockedAt: 1,
          loginAttempts: 1,
          loginAttemptAt: 1,
          type: 1,
          totp: 1,
          _id: 1,
          email: 1,
        },
      )
      .hint({ email: 1 });

    if (!account) {
      ApiException.badData('ACCOUNT.NOT_FOUND');
    }

    if (account.blockedAt) {
      ApiException.badData('ACCOUNT.BLOCKED');
    }

    return account;
  }

  private async incrementLoginAttempts(
    id: Types.ObjectId,
    currentAttempts: number,
  ): Promise<void> {
    await this.$AccountModel.updateOne(
      { _id: id },
      {
        $set: {
          loginAttempts: currentAttempts + 1,
          loginAttemptAt: new Date(),
        },
      },
    );
  }

  private async resetLoginAttempts(id: Types.ObjectId): Promise<void> {
    await this.$AccountModel.updateOne(
      { _id: id },
      { $set: { loginAttempts: 0 } },
    );
  }

  private async handleSuccessfulLogin(account: AccountDocument): Promise<{
    nextStep: NextStep;
  }> {
    // Update last login time
    await this.$AccountModel.updateOne(
      { _id: account._id },
      { $set: { lastLogin: new Date() } },
    );

    const result = await this.$sessionService.create({
      id: account._id.toHexString(),
      type: account.type,
    });
    return { nextStep: NextStep.None, ...result };
  }

  private async checkLoginAttempts(
    account: Pick<Account, 'email' | 'loginAttempts' | 'loginAttemptAt'> & {
      _id: Types.ObjectId;
    },
  ): Promise<void> {
    const now = moment();
    // If no previous attempt, use current time
    const loginAttemptAt = account.loginAttemptAt
      ? moment(account.loginAttemptAt)
      : now;
    const loginBlockedUntil = moment(loginAttemptAt).add(
      BLOCK_TIMES.LOGIN.AMOUNT,
      BLOCK_TIMES.LOGIN.UNIT,
    );

    // Reset attempts if block window is over
    if (loginBlockedUntil.isBefore(now)) {
      await this.$AccountModel.updateOne(
        { _id: account._id },
        { $set: { loginAttempts: 0 } },
      );
      account.loginAttempts = 0;
      return;
    }

    // Check if attempts exceed limit
    if (account.loginAttempts >= MAX_ATTEMPTS.LOGIN - 1) {
      const remaining = Math.ceil(loginBlockedUntil.diff(now, 'minutes', true));
      if (remaining > 0) {
        this.$logger.debug(`Login blocked for email ${account.email}`);
        ApiException.badDataWith(
          {
            LOGIN_ATTEMPTS: `${MAX_ATTEMPTS.LOGIN}`,
            BLOCK_TIME: `${BLOCK_TIMES.LOGIN.AMOUNT}`,
          },
          'ACCOUNT.LOGIN_BLOCKED',
        );
      }
      // Reset attempts if block time is over
      await this.$AccountModel.updateOne(
        { _id: account._id },
        { $set: { loginAttempts: 0 } },
      );
      account.loginAttempts = 0;
    }
  }

  private handleAdminLogin(
    account: Pick<Account, 'email' | 'type' | 'totp'> & { _id: Types.ObjectId },
  ): {
    nextStep: NextStep;
    mfaToken: string;
    qrUrl?: string;
    platform?: MFAPlatform;
  } {
    if (!account.totp) {
      const auth = mfaUtil.create(account.email);
      return {
        nextStep: NextStep.Setup,
        mfaToken: this.$tokenService.genMFAToken({
          aid: account._id.toHexString(),
          tid: Date.now().toString(),
          typ: account.type,
          scr: auth.secret,
        }),
        qrUrl: auth.url,
      };
    }
    return {
      nextStep: NextStep.Verify,
      mfaToken: this.$tokenService.genMFAToken({
        aid: account._id.toHexString(),
        tid: Date.now(),
        typ: account.type,
      }),
      platform: account.totp.platform as MFAPlatform,
    };
  }
}
