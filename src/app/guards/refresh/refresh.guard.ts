import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheService } from '@shared/cache';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from '@api/api.exception';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class RefreshGuard extends AuthGuard('refresh') {
  constructor(private $cache: CacheService) {
    super();
  }
  getRequest(context: ExecutionContext): Request {
    const gqlCtx = GqlExecutionContext.create(context);
    const request =
      gqlCtx.getContext()?.req || context.switchToHttp().getRequest();
    request['ctx'] = context;
    return request;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    const result = await super.canActivate(context);
    if (!result) {
      ApiException.unAuthorized('Session Expired');
    }
    if (!req.user) {
      ApiException.unAuthorized('Un Authorized');
    }
    const isTokenBlocked = await this.$cache.isTokenBlocked(
      req.user.token.id,
      req.user.id,
      req.user.token.issuedAt,
    );
    if (isTokenBlocked) {
      ApiException.unAuthorized('Session Expired');
    }
    return result as boolean;
  }
}
