import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '@shared/env';
import { UserType } from '@app/app.constants';
@Injectable()
export class MFAStrategy extends PassportStrategy(Strategy, 'mfa') {
  constructor({ SECRETS }: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SECRETS.MFA_TOKEN,
    });
  }
  async validate(payload: Record<string, string>): Promise<IUser> {
    return {
      id: payload.aid,
      type: payload.typ as UserType,
      secret: payload.scr,
      social: payload.scl as unknown as ISocial,
      email: payload?.email as unknown,
      name: payload?.name as unknown,
      password: payload?.password as string,
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
