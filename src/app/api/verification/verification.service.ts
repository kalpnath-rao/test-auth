import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IVerificationModel, Verification } from './schema/verification.schema';
import type { TSend, IVerify } from './verification.types';
import { ApiException } from '../api.exception';
import { EnvService } from '@shared/env';
import { VChannel } from './verification.enum';
import { ProducerService } from '@app/kafka';
import {
  BLOCK_TIME,
  RESEND_INTERVAL,
  MAX_ATTEMPTS,
  BLOCK_TIMES,
  OTP_EXPIRE_TIME,
} from './verification.constants';
import { CacheService } from '@shared/cache';
import { passwordUtil } from '@utils/password.util';
import * as moment from 'moment-timezone';
import { Types } from 'mongoose';

/**
 * Context object for OTP verification operations
 */
interface IOtpVerificationContext {
  email: string;
  now: Date;
  createdAt: Date;
  loginAttempts: number;
  loginAttemptAt: Date;
  _id: Types.ObjectId;
}
@Injectable()
export class VerificationService {
  constructor(
    private $env: EnvService,
    private $cache: CacheService,
    private $producer: ProducerService,
    @InjectModel(Verification.name) public readonly Model: IVerificationModel,
  ) {}
  async send(options: TSend): Promise<Date> {
    const channel = options.channel;
    const sendTo = channel === VChannel.SMS ? options.to : options.email;
    if (await this.$cache.isExhausted(sendTo)) {
      ApiException.exhaustedWith(
        { BLOCK_TIME, MAX_ATTEMPTS },
        'VERIFICATION.EXHAUSTED',
      );
    }
    // List all the attempts done by the user
    const list = await this.Model.find(options, ['createdAt'])
      .sort({
        createdAt: -1,
      })
      .lean();
    if (list.length > MAX_ATTEMPTS) {
      await this.$cache.markExhausted(sendTo, BLOCK_TIME * 60);
      ApiException.exhaustedWith(
        { BLOCK_TIME, MAX_ATTEMPTS },
        'VERIFICATION.EXHAUSTED',
      );
    } else if (list.length) {
      const sentAt = list[0].createdAt.getTime();
      const maxAt = Date.now() - RESEND_INTERVAL * 1000;
      if (sentAt > maxAt) {
        ApiException.exhaustedWith(
          { TIME: RESEND_INTERVAL },
          'VERIFICATION.FREQUENT',
        );
      }
    }
    const otp = this.#genCode();
    const result = await this.Model.create({
      ...options,
      otp: await passwordUtil.hash(otp),
    });
    if (options.channel === VChannel.SMS) {
      this.#sendSMS(otp, options.to);
    } else if (options.channel === VChannel.Email) {
      this.#sendMail(otp, options.email, options.name);
    }
    return result.createdAt;
  }

  async sendSMS(to: string): Promise<Date> {
    return await this.send({
      to,
      channel: VChannel.SMS,
    });
  }

  async sendMail(email: string, firstName?: string): Promise<Date> {
    return await this.send({
      email,
      channel: VChannel.Email,
      name: firstName || 'User',
    });
  }

  #genCode(len = 6): string {
    const otp = +Math.random().toString().slice(2);
    return otp.toString().slice(0, len);
  }

  #sendSMS(otp: string, to: string): void {
    this.$producer.verifyAccount({ to, otp }, 'SMS');
  }

  #sendMail(otp: string, to: string, name: string): void {
    this.$producer.verifyAccount({ to, otp, name }, 'Mail');
  }

  async verify({ to, otp }: IVerify): Promise<string> {
    const result = await this.Model.findOne({ to })
      .sort({
        createdAt: -1,
      })
      .lean();
    if (!result) {
      ApiException.badData('VERIFICATION.EXPIRED');
    }
    if (otp !== this.$env.OTP_BYPASS) {
      const invalid = await passwordUtil.misMatch(otp, result.otp);
      if (invalid) {
        ApiException.badData('VERIFICATION.INVALID');
      }
    }
    await this.Model.deleteOne({ _id: result._id });
    return result._id.toHexString();
  }

  /**
   * Verifies the OTP for the given user
   * @param payload - The verification payload containing to and otp
   * @returns The verification ID if successful
   * @throws ApiException if verification fails
   */
  async verifyOtp({ email, otp }: IVerify): Promise<string> {
    // Use projection to fetch only needed fields and leverage the index
    const result = await this.Model.findOne(
      { email: email },
      { otp: 1, createdAt: 1, loginAttempts: 1, loginAttemptAt: 1, _id: 1 },
    )
      .sort({ createdAt: -1 })
      .lean();

    if (!result) {
      ApiException.badData('VERIFICATION.EXPIRED');
    }

    const now = new Date();
    const context: IOtpVerificationContext = {
      email,
      now,
      createdAt: result.createdAt,
      loginAttempts: result.loginAttempts || 0,
      loginAttemptAt: result.loginAttemptAt,
      _id: result._id,
    };

    // If bypassing OTP for testing purposes
    if (otp !== this.$env.OTP_BYPASS) {
      // Check OTP expiry (10 minutes)
      await this.#checkOtpExpiration(context);

      // Check if user is temporarily blocked
      await this.#checkOtpBlocked(context);

      // Verify OTP
      const invalid = await passwordUtil.misMatch(otp, result.otp);
      if (invalid) {
        await this.#incrementAttempts(context);
        ApiException.badData('VERIFICATION.INVALID');
      }
    }

    // OTP is valid — delete the record
    await this.Model.deleteOne({ _id: result._id });
    return result._id.toHexString();
  }

  /**
   * Checks if the OTP has expired (10 minutes)
   */
  async #checkOtpExpiration(context: IOtpVerificationContext): Promise<void> {
    const minutesSinceCreated =
      (context.now.getTime() - context.createdAt.getTime()) / (1000 * 60);
    if (minutesSinceCreated > OTP_EXPIRE_TIME) {
      ApiException.badData('VERIFICATION.EXPIRED');
    }
  }

  /**
   * Checks if the user is temporarily blocked due to too many attempts
   */
  async #checkOtpBlocked(context: IOtpVerificationContext): Promise<void> {
    const { loginAttempts, loginAttemptAt, _id } = context;
    const lastAttemptAt = loginAttemptAt ? new Date(loginAttemptAt) : null;

    if (loginAttempts >= MAX_ATTEMPTS) {
      const minutesSinceLastAttempt = lastAttemptAt
        ? (context.now.getTime() - lastAttemptAt.getTime()) / (1000 * 60)
        : 0;

      if (minutesSinceLastAttempt < BLOCK_TIME) {
        ApiException.badData('VERIFICATION.MAX_ATTEMPTS_EXCEEDED');
      } else {
        // Reset attempts after cooldown
        await this.#resetAttempts(_id);
      }
    }
  }

  /**
   * Increments the attempt counter for failed OTP verification
   */
  async #incrementAttempts(context: IOtpVerificationContext): Promise<void> {
    await this.Model.updateOne(
      { _id: context._id },
      {
        $set: {
          loginAttempts: context.loginAttempts + 1,
          loginAttemptAt: context.now,
        },
      },
    );
  }

  /**
   * Resets the attempt counter
   */
  async #resetAttempts(_id: Types.ObjectId): Promise<void> {
    await this.Model.updateOne(
      { _id },
      { $set: { loginAttempts: 0, loginAttemptAt: null } },
    );
  }

  async checkAttempts(to: string): Promise<void> {
    const result = await this.Model.findOne({ to })
      .sort({
        createdAt: -1,
      })
      .lean();
    if (result && result.loginAttemptAt) {
      const { AMOUNT, UNIT } = BLOCK_TIMES.VERIFICATION;
      if (moment(result.loginAttemptAt).add(AMOUNT, UNIT).isBefore(moment())) {
        result.loginAttempts = 0;
      }
      if (result.loginAttempts >= MAX_ATTEMPTS) {
        ApiException.exhaustedWith(null, 'ACCOUNT.LOGIN_BLOCKED');
      }
    }
  }
}
