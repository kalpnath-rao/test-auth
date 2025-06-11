import { ApiException } from '@app/api/api.exception';
import { CacheService } from '@app/shared/cache';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard as Guard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AuthGuard extends Guard('auth') {
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
    const request = this.getRequest(context);
    // const isGraphQL = context.getType<GqlContextType>() === 'graphql';
    // const request = isGraphQL
    //   ? GqlExecutionContext.create(context).getContext().req
    //   : context.switchToHttp().getRequest();

    // request['ctx'] = context;

    const result = (await super.canActivate(context)) as boolean;

    if (!request.user) {
      ApiException.unAuthorized('Un Authorized');
    }

    const isTokenBlocked = await this.$cache.isTokenBlocked(
      request.user.token.id,
      request.user.id,
      request.user.token.issuedAt,
    );

    if (isTokenBlocked) {
      ApiException.unAuthorized('Un Authorized');
    }

    return result;
  }
}
