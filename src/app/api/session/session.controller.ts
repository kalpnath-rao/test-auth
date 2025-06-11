import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { User } from '@decorators/user.decorator';
import { Message } from '@decorators/message.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { RefreshGuard } from '@guards/refresh';
import { ErrorResponseDto } from '@api/api.dto';
import { LogoutResponseDto } from './dto/logout.dto';
import { AuthGuard } from '@app/guards';
import { CreateResponseDto } from './dto/create.dto';

@Controller({
  path: 'sessions',
})
@ApiUnprocessableEntityResponse({
  type: ErrorResponseDto,
})
@ApiTags('Session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Delete('/logout')
  @UseGuards(RefreshGuard)
  @ApiBearerAuth('RefreshToken')
  @Message('SESSION.LOGOUT_SUCCESS')
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiOperation({ summary: 'ADMIN & USER | Logout Session' })

  /**
   * Logs out the current user by invalidating their session.
   *
   * @param user - The user object containing the token and id of the user.
   * @returns A promise that resolves when the logout process is complete.
   */
  async logout(@User() user: IUser): Promise<void> {
    await this.sessionService.logout(user.token, user.id);
  }

  @Get('/refresh')
  @UseGuards(RefreshGuard)
  @ApiBearerAuth('RefreshToken')
  @Message('SESSION.SUCCESS')
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiOperation({
    summary: 'ADMIN & USER | Regenerate access token by refresh token',
  })
  /**
   * Regenerates an access token using the provided refresh token.
   * @param user - User object containing the id and type of the user.
   * @returns A promise that resolves to a new access token string.
   */
  async refresh(@User() user: IUser): Promise<string> {
    return await this.sessionService.refresh(user);
  }

  @Get('/current')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AuthToken')
  @Message('SESSION.SUCCESS')
  @ApiOkResponse({ type: CreateResponseDto })
  @ApiOperation({
    summary:
      ' ADMIN & USER | Generate access token (Need to be requested from API Gateway)',
  })
  /**
   * Generates an access token by current user data.
   * @param user - User object containing the id and type of the user.
   * @returns A promise that resolves to an access token string.
   */
  async current(@User() user: IUser): Promise<string> {
    return await this.sessionService.generate(user);
  }
}
