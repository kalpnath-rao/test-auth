import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class PasswordGuard extends AuthGuard('password') {
  getRequest(context: ExecutionContext): Request {
    // Use GraphQL context if available, else default to HTTP
    const gqlCtx = GqlExecutionContext.create(context);
    const request =
      gqlCtx.getContext()?.req || context.switchToHttp().getRequest();
    request['ctx'] = context; // Optional: store ExecutionContext
    return request;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.getRequest(context);
    return super.canActivate(context);
  }
}
