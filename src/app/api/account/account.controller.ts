import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  Param,
  StreamableFile,
  Put,
  Get,
  Patch,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  EmailStatusResponseDto,
  EmailStatusDto,
  LoginPayloadDto,
  LoginResponseDto,
  LoginResultDto,
} from './dto/login.dto';

import {
  VerifyMFAPayloadDto,
  VerifyMFAResponseDto,
  VerifyMFAResultDto,
} from './dto/verify-mfa.dto';

import {
  ApiHeaders,
  ApiBasicAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Message, User } from '@decorators/index';
import { COMMON_HEADERS } from '@api/api.dto';
import { BasicGuard, MFAGuard } from '@guards/index';
import { EmailCheckStep, NextStep } from './enum/auth.enum';
import { Request } from 'express';
import { mfaUtil } from '@utils/mfa.util';
import { plainToInstance } from 'class-transformer';
import {
  SocialPayloadDto,
  SocialResponseDto,
  SocialResultDto,
} from './dto/social.dto';
import { AuthGuard } from '@app/guards';
import { ResetMFAResponseDto } from './dto/reset-mfa.dto';

import { ToggleMfaDto, ToggleMfaResponseDto } from './dto/mfa-toggle.dto';
import { ClearCache } from '@app/decorators/cache.decorator';
import { AccountLoginService } from './services/account.login.service';
import { AccountMfaService } from './services/account.mfa.service';
import { AccountSocialService } from './services/account.social.service';
import { AccountAuthService } from './services/account.auth.service';
@Controller({
  path: 'accounts',
})
@ApiHeaders(COMMON_HEADERS)
@ApiTags('Accounts')
export class AccountController {
  constructor(
    private readonly $accountService: AccountService,
    private readonly $accountLoginService: AccountLoginService,
    private readonly $accountMfaService: AccountMfaService,
    private readonly $accountSocialService: AccountSocialService,
    private readonly $accountAuthService: AccountAuthService,
  ) {}

  @Post('login')
  @UseGuards(BasicGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.OK)
  @Message('ACCOUNT.LOGIN_SUCCESS')
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({ summary: 'ADMIN |Login with email & password' })
  /**
   * @description
   * Login with email and password. If the user has MFA enabled but not setup, the API will return the QR code
   * of the MFA secret to be used for the setup. The QR code is returned as a PNG image.
   *
   * @param payload - Body payload containing the email and password
   * @param req - Express request object
   *
   * @returns The login result, which can be either a JSON object or a PNG image (if the user needs to setup MFA)
   */
  async login(
    @Body() payload: LoginPayloadDto,
    @Req() req: Request,
  ): Promise<LoginResultDto | StreamableFile> {
    const result = await this.$accountLoginService.login(payload);
    if (result.nextStep === NextStep.Setup) {
      const { accept } = req.headers;
      if (accept === 'image/png') {
        req.res?.setHeader('Token', result.mfaToken as string);
        const buffer = await mfaUtil.toBuffer(result.qrUrl as string);
        return new StreamableFile(buffer, {
          type: 'image/png',
          length: buffer.length,
          disposition: 'qr.png',
        });
      }
      result.qrUrl = await mfaUtil.toUrl(result.qrUrl as string);
    }
    return plainToInstance(LoginResultDto, result);
  }
  @Put('login')
  @UseGuards(MFAGuard)
  @ApiBasicAuth('MFAToken')
  @HttpCode(HttpStatus.OK)
  @Message('ACCOUNT.MFA_VERIFIED')
  @ApiOkResponse({ type: VerifyMFAResponseDto })
  @ApiOperation({ summary: 'ADMIN | Verify MFA with otp' })
  /**
   * @description
   * Verify MFA with the given OTP.
   *
   * @param payload - Body payload containing the OTP
   * @param user - User object containing the id and type of the user
   *
   * @returns The verify MFA result, which is JSON object
   */
  async verifyMFA(
    @Body() payload: VerifyMFAPayloadDto,
    @User() user: IUser,
  ): Promise<VerifyMFAResultDto> {
    payload.type = user.type;
    payload.secret = user.secret;
    const result = await this.$accountMfaService.verifyMFA(payload, user.id);
    return plainToInstance(VerifyMFAResultDto, result);
  }

  @Post('social')
  @UseGuards(BasicGuard)
  @ApiBasicAuth()
  @Message((_, result: SocialResultDto) => {
    if (result.nextStep === NextStep.Setup) {
      return 'ONBOARD.SOCIAL_SETUP';
    }
    return 'ONBOARD.VERIFIED';
  })
  @ApiOperation({ summary: 'USER |Social Login' })
  @ApiOkResponse({ type: SocialResponseDto })
  /**
   * @description
   * Login with social providers (google, facebook, etc) with the given payload.
   *
   * @param payload - Body payload containing the social provider, id and email
   *
   * @returns The social login result, which is JSON object .
   */
  async social(@Body() payload: SocialPayloadDto): Promise<SocialResultDto> {
    const result = await this.$accountSocialService.socialLogin(payload);
    const response = SocialResultDto.parse(result);
    return response;
  }

  @Put('reset-mfa/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ResetMFAResponseDto })
  @Message('ACCOUNT.MFA_RESET')
  @ApiOperation({ summary: 'ADMIN| Reset MFA' })
  /**
   * @description
   * Resets the MFA for the user with the given ID. This will invalidate the
   * MFA token and the user will have to setup MFA again.
   *
   * @param id - The user ID to reset MFA for.
   *
   * @returns A promise that resolves when the MFA has been reset.
   */
  async resetMfa(@Param('id') id: string): Promise<boolean> {
    await this.$accountMfaService.resetMfa(id);
    return true;
  }

  @Get('permissions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @Message('ACCOUNT.SUCCESS_PERMISSIONS')
  @ApiOperation({ summary: 'ADMIN| Get permissions' })
  /**
   * @description
   * Fetches the permissions for the given user. This method is only accessible
   * by authenticated users.
   *
   * @param user - The user object containing the id and type of the user.
   *
   * @returns A promise that resolves to an array of strings representing the
   * permissions of the user.
   */
  async permissions(@User() user: IUser): Promise<Record<string, string[]>> {
    const result = await this.$accountService.permissions(user.id);
    return result;
  }

  @Patch('/mfa-toggle')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @HttpCode(HttpStatus.OK)
  @Message((req) => {
    if (req.body.enabled) {
      return 'ACCOUNT.MFA_ENABLED_SUCCESS';
    }
    return 'ACCOUNT.MFA_DISABLED_SUCCESS';
  })
  @ApiOkResponse({ type: ToggleMfaResponseDto })
  @ApiOperation({ summary: 'USER | Toggle MFA On/Off' })
  @ClearCache({
    tag: 'USER_PROFILE',
  })
  /**
   * @description
   * Toggles MFA for the user.
   *
   * @param toggleMfaDto - The toggle MFA payload containing the enabled state.
   * @param user - The user object containing the id and type of the user.
   *
   * @returns A promise that resolves to a boolean indicating the success of the
   * toggle.
   */
  async toggleMfa(
    @Body() toggleMfaDto: ToggleMfaDto,
    @User() user: IUser,
  ): Promise<boolean> {
    await this.$accountMfaService.toggleMfa(toggleMfaDto, user.id);
    return true;
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if email exists and return appropriate response',
  })
  @ApiOkResponse({ type: EmailStatusResponseDto })
  async checkEmail(
    @Body() payload: EmailStatusDto,
  ): Promise<EmailStatusResponseDto> {
    const status = await this.$accountAuthService.checkEmailStatus(
      payload.email,
    );
    return plainToInstance(EmailStatusResponseDto, {
      ...status,
      nextStep: status.exists
        ? status.deletedAt
          ? EmailCheckStep.REGISTER
          : EmailCheckStep.LOGIN
        : EmailCheckStep.REGISTER,
    });
  }
}
