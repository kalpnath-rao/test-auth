import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '@shared/env';
import { UserType } from '@app/app.constants';

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy, 'password') {
  constructor({ SECRETS }: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SECRETS.PASSWORD_TOKEN,
    });
  }
  async validate(payload: Record<string, string>): Promise<IUser> {
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
}
