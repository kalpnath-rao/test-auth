import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserType } from '../app.constants';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const request = gqlCtx.getContext().req;
    return request.user;
  },
);
export interface IToken {
  id: string;
  issuedAt: Date;
  expiredAt: Date;
  audience: string;
  subject: string;
  issuer: string;
}

export interface IUser {
  id: string;
  type: UserType;
  token: IToken;
  secret?: string;
}
