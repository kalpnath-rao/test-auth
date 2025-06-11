import { Message } from '@decorators/message.decorator';
import { AuthGuard } from '@guards/auth';
import { BasicGuard } from '@guards/basic';
import { Body, Controller, Patch, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ForgetPasswordDto,
  ForgetPasswordResponseDto,
} from './dto/forget-password.dto';
import { PasswordService } from './password.service';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import {
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from './dto/change-password.dto';
import { User } from '@decorators/user.decorator';
import { PasswordGuard } from '@guards/password';
import { ApiException } from '../api.exception';
import {
  VerifyPasswordDto,
  VerifyPasswordResponseDto,
} from './dto/verify-password.dto';

@Controller({
  path: 'passwords',
})
@ApiTags('Password')
export class PasswordController {
  constructor(private $pwdService: PasswordService) {}
  @Post()
  @UseGuards(BasicGuard)
  @ApiBasicAuth()
  @Message('PASSWORD.MAIL_SENT')
  @ApiOkResponse({ type: ForgetPasswordResponseDto })
  @ApiOperation({
    summary:
      'ADMIN  Forget Password Request when sending reset link on email only',
  })
  /**
   * Sends a reset password email to the given email address, if the email
   * address exists in the database.
   * @param body The body of the request which contains the email address to
   * reset the password for.
   * @returns A boolean indicating whether the email was sent or not.
   */
  async forget(@Body() body: ForgetPasswordDto): Promise<boolean> {
    await this.$pwdService.forget(body.email);
    return true;
  }
  @Put()
  @UseGuards(PasswordGuard)
  @ApiBearerAuth('PasswordToken')
  @Message('PASSWORD.RESET_DONE')
  @ApiOkResponse({ type: ResetPasswordResponseDto })
  @ApiOperation({ summary: 'ADMIN | Reset Password' })
  /**
   * Resets the password for the given user using the password reset token.
   * @param user The user object containing the id and type of the user.
   * @param password The new password to set for the user.
   * @returns A boolean indicating whether the password was reset or not.
   */
  async reset(
    @User() user: IUser,
    @Body() { password }: ResetPasswordDto,
  ): Promise<boolean> {
    await this.$pwdService.reset(password, user.token.id);
    return true;
  }
  @Patch()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @Message('PASSWORD.CHANGED')
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  @ApiOperation({ summary: 'ADMIN | Change Password (After Login)' })
  /**
   * Changes the password for the given user.
   * @param user The user object containing the id and type of the user.
   * @param payload The body of the request which contains the current and new
   * password to set for the user.
   * @returns A boolean indicating whether the password was changed or not.
   */
  async change(
    @User() user: IUser,
    @Body() payload: ChangePasswordDto,
  ): Promise<boolean> {
    if (payload.currentPassword === payload.newPassword) {
      ApiException.badData('PASSWORD.USED_PWD');
    }
    await this.$pwdService.change(payload, user.id);
    return true;
  }

  @Post('/verify')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @Message('PASSWORD.VERIFY_PASS')
  @ApiOkResponse({ type: VerifyPasswordResponseDto })
  @ApiOperation({
    summary: 'ADMIN | Verify Password while Editing profile(ADMIN)',
  })
  /**
   * Verifies the password for the given user.
   * @param user The user object containing the id and type of the user.
   * @param payload The body of the request which contains the password to verify
   * for the user.
   * @returns A boolean indicating whether the password was verified or not.
   */
  async verify(
    @User() user: IUser,
    @Body() payload: VerifyPasswordDto,
  ): Promise<boolean> {
    await this.$pwdService.verify(payload, user.id);
    return true;
  }
}
