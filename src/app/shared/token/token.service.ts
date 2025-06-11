import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MfaTokenPayload, TokenPayload } from './token.interfaces';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { EnvService } from '../env';
import { IUser } from 'src/app/decorators/user.decorator';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { UserType } from '@app/app.constants';

@Injectable()
export class TokenService {
  readonly #ISSUER = 'APPINVENTIV';
  readonly #AUDIENCE = 'https://api.example.com';
  readonly #SECRETS = this.$env.SECRETS;
  constructor(
    private readonly $env: EnvService,
    private readonly jwtService: JwtService,
  ) {}

  verifyMFAToken(jwt: string): MfaTokenPayload {
    try {
      const artifacts = this.jwtService.decode(jwt);
      this.jwtService.verify(jwt, {
        secret: this.#SECRETS.MFA_TOKEN,
      });
      return artifacts as MfaTokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new HttpException('auth.AUTH_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      throw err;
    }
  }

  genToken(payload: object, options: JwtSignOptions = {}): string {
    return this.jwtService.sign(payload, {
      audience: this.#AUDIENCE,
      issuer: this.#ISSUER,
      ...options,
    });
  }

  genMFAToken(payload: Record<string, unknown>): string {
    return this.genToken(payload, {
      secret: this.#SECRETS.MFA_TOKEN,
    });
  }

  genAuthToken(payload: Record<string, unknown>): string {
    return this.genToken(payload, {
      algorithm: 'HS256',
      expiresIn: 12 * 300, // 1 hour
      subject: 'auth',
      secret: this.#SECRETS.AUTH_TOKEN,
    });
  }

  verifyAuthToken(token: string): IUser {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.#SECRETS.AUTH_TOKEN,
      });
      return this.formatPayload(payload);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new HttpException('auth.AUTH_EXPIRED', HttpStatus.UNAUTHORIZED);
      } else if (err instanceof JsonWebTokenError) {
        throw new HttpException('auth.AUTH_INVALID', HttpStatus.UNAUTHORIZED);
      }
      throw err;
    }
  }

  genAccessToken(payload: TokenPayload): string {
    return this.genToken(payload, {
      algorithm: 'RS256',
      expiresIn: 3600, // 1 hour
      subject: 'access',
    });
  }

  genRefreshToken(payload: Record<string, unknown>): string {
    return this.genToken(payload, {
      algorithm: 'HS256',
      expiresIn: '7d',
      subject: 'refresh',
      secret: this.#SECRETS.REFRESH_TOKEN,
    });
  }

  genPasswordToken(payload: Record<string, unknown>): string {
    return this.genToken(payload, {
      algorithm: 'HS256',
      // expiresIn: '120s',
      expiresIn: '7d',
      subject: 'password',
      secret: this.#SECRETS.PASSWORD_TOKEN,
    });
  }

  verifyPasswordToken(token: string): Record<string, unknown> {
    const result = this.jwtService.verify(token, {
      secret: this.#SECRETS.PASSWORD_TOKEN,
    });
    return result;
  }

  formatPayload(payload: Record<string, string>): IUser {
    return {
      id: payload.aid,
      type: payload.typ as UserType,
      token: {
        id: payload.tid,
        issuedAt: new Date(parseInt(payload.iat.toString()) * 1000),
        expiredAt: new Date(parseInt(payload.exp.toString()) * 1000),
        audience: payload.aud,
        subject: payload.sub,
        issuer: payload.iss,
      },
    };
  }

  getDataFromToken(token: string): Record<string, unknown> {
    const result = this.jwtService.decode(token);
    return result;
  }
}
