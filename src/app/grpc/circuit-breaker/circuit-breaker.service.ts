import {
  InterceptingCall,
  Interceptor,
  InterceptorOptions,
  StatusObject,
  NextCall,
  status,
} from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { BREAKER_OPTIONS } from './circuit-breaker.constants';
import { BreakerConfig } from './circuit-breaker.types';
import { BreakerStateData } from './circuit-breaker.model';
import { ClsService } from 'nestjs-cls';

interface GrpcInterceptor {
  intercept: (client: string) => Interceptor;
}

@Injectable()
export class CircuitBreaker implements GrpcInterceptor {
  @Inject(BREAKER_OPTIONS) config: BreakerConfig;
  @Inject() cls: ClsService;

  get failureThreshold(): number {
    return this.config?.failureThreshold ?? 3;
  }

  get successThreshold(): number {
    return this.config?.successThreshold ?? 3;
  }

  get timeout(): number {
    return this.config?.timeout ?? 30 * 1000;
  }

  intercept(name: string): Interceptor {
    const client = new BreakerStateData(name);
    const commands: Map<string, BreakerStateData> = new Map();
    return (options: InterceptorOptions, nextCall: NextCall) => {
      client.checkHealth();
      const method = options.method_definition.path.split('/').pop();
      let command = commands.get(method);
      if (command) {
        command.checkHealth();
      } else {
        command = commands[method] = new BreakerStateData(method);
      }

      return new InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const correlationId = this.cls.get('CORRELATION_ID');
          metadata.add('correlation_id', correlationId);
          next(metadata, {
            ...listener,
            onReceiveStatus: (_status: StatusObject) => {
              switch (_status.code) {
                case status.OK: {
                  client.analyzeSuccess(this.successThreshold);
                  command.analyzeSuccess(this.successThreshold);
                  break;
                }
                case status.UNAVAILABLE: {
                  client.analyzeFailure(this.failureThreshold, this.timeout);
                  break;
                }
                default: {
                  command.analyzeFailure(this.failureThreshold, this.timeout);
                  break;
                }
              }
              listener.onReceiveStatus(_status);
            },
          });
        },
      });
    };
  }
}
