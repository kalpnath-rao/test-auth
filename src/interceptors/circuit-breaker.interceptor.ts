// grpc-circuit-breaker.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { logger } from 'nestjs-i18n';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GrpcCircuitBreakerInterceptor implements NestInterceptor {
  private isCircuitOpen = false; // Initialize as closed
  private failureCount = 0;
  private failureThreshold = 3; // Number of consecutive failures to trigger circuit open

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.isCircuitOpen) {
      logger.error(context.getArgs());
      // Reject the request when the circuit is open
      return throwError(() => new Error('gRPC Circuit Open'));
    } else {
      return next.handle().pipe(
        catchError((error) => {
          this.failureCount++;
          if (this.failureCount >= this.failureThreshold) {
            this.isCircuitOpen = true;
            setTimeout(() => {
              this.isCircuitOpen = false;
              this.failureCount = 0;
            }, 60000); // Wait for 1 minute before recovery
          }
          return throwError(() => error);
        }),
      );
    }
  }
}
