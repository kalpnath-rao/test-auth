import { TIMEOUT_METADATA } from '@decorators/timeout.decorator';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private $reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const TIMEOUT = this.$reflector.get(TIMEOUT_METADATA, context.getHandler());
    return next.handle().pipe(
      timeout(TIMEOUT ?? 100000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
