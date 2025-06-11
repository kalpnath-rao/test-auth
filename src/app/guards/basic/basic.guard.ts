import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class BasicGuard extends AuthGuard('basic') {
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
    return super.canActivate(context);
  }
}
