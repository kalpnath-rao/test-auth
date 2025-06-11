import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class MFAGuard extends AuthGuard('mfa') {
  getRequest(context: ExecutionContext): Request {
    const gqlCtx = GqlExecutionContext.create(context);
    const request =
      gqlCtx.getContext()?.req || context.switchToHttp().getRequest();
    request['ctx'] = context;
    return request;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.getRequest(context);
    return super.canActivate(context);
  }
}
