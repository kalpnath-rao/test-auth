import { AppLogger } from '@app/shared/logger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  constructor(private logger: AppLogger) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const id = uuid();
    if (context.getType() === 'http') {
      this.logger.setCorrelationId(id);
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();
      req.correlationId = id;
      this.logger.request(ctx.getRequest(), ctx.getResponse(), id);
    }
    if (context.getType() === 'rpc') {
      const t1 = Date.now();
      const ctx = context.switchToRpc();
      const rpcCtx = ctx.getContext();
      const rpcData = ctx.getData();
      const correlationId = rpcCtx.get('correlation_id')[0] || id;
      this.logger.setCorrelationId(correlationId);
      return next.handle().pipe(
        tap(() => {
          this.logger.log(
            `${context.getClass().name},Method: ${context.getHandler().name} +${
              Date.now() - t1
            }ms`,
          );
        }),
        catchError((error) => {
          const errorResponse = {
            status: 500,
            message: error.message || 'An unexpected error occurred',
          };
          this.logger.error(error.message, error.stack);
          this.logger.error(JSON.stringify(rpcData), '');
          this.logger.error(
            `${context.getClass().name},Method: ${context.getHandler().name} +${
              Date.now() - t1
            }ms`,
            '',
          );
          return throwError(() => new RpcException(errorResponse));
        }),
      );
    }
    return next.handle();
  }
}
