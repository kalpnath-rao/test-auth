import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { EnvService } from '@shared/env';
import { ApiException } from '@api/api.exception';
import { SocialPayloadDto } from '@api/account/dto/social.dto';
import { UserType } from '@app/app.constants';
import { SocialType } from '@api/account/enum/auth.enum';

@Injectable()
export class GoogleAuthUtil {
  private readonly logger = new Logger(GoogleAuthUtil.name);
  private readonly googleClient: OAuth2Client;

  constructor(private readonly envService: EnvService) {
    this.googleClient = new OAuth2Client(
      this.envService.GOOGLE.CLIENT_ID,
      this.envService.GOOGLE.CLIENT_SECRET,
      this.envService.GOOGLE.REDIRECT_URI,
    );
  }

  /**
   * Validates a Google ID token and extracts user information
   * @param idToken - The Google ID token to validate
   * @returns SocialPayloadDto containing user information
   * @throws ApiException if token is invalid or required fields are missing
   */
  async validateToken(token: string): Promise<SocialPayloadDto> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.envService.GOOGLE.CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        ApiException.badData('ACCOUNT.INVALID_TOKEN');
      }

      if (!payload.email || !payload.sub) {
        ApiException.badData('ACCOUNT.INVALID_TOKEN');
      }

      return {
        userType: UserType.User,
        socialType: SocialType.Google,
        socialId: payload.sub,
        email: payload.email,
        name: {
          first: payload.given_name || '',
          last: payload.family_name || '',
        },
      };
    } catch (error) {
      this.logger.error('Error validating Google token:', error);
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }
  }

  /**
   * Exchanges authorization code for tokens
   * @param code - The authorization code from Google
   * @returns Object containing id_token and access_token
   * @throws ApiException if token exchange fails
   */
  async exchangeAuthorizationCode(
    code: string,
  ): Promise<{ id_token: string; access_token: string }> {
    try {
      const { tokens } = await this.googleClient.getToken(code);

      if (!tokens.id_token) {
        this.logger.error('Failed to obtain id_token from Google');
        ApiException.badData('ACCOUNT.INVALID_TOKEN');
      }

      return {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
      };
    } catch (error) {
      this.logger.error('Error exchanging authorization code:', error);
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }
  }
}
