import { EnvService } from '@app/shared/env';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { resolve } from 'node:path';
import {
  AUTH_PACKAGE,
  AUTH_CLIENT,
  USER_CLIENT,
  USER_PACKAGE,
} from './grpc.constants';
import { GrpcService } from './grpc.service';
import { CircuitBreaker } from './circuit-breaker/circuit-breaker.service';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';

@Module({
  imports: [
    CircuitBreakerModule.register({
      failureThreshold: 3,
      successThreshold: 3,
      timeout: 60000,
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_CLIENT,
        inject: [EnvService, CircuitBreaker],
        useFactory({ GRPC }: EnvService, breaker: CircuitBreaker) {
          return {
            transport: Transport.GRPC,
            options: {
              channelOptions: {
                interceptors: [breaker.intercept(AUTH_CLIENT)],
              },
              url: GRPC.AUTH_SERVICE,
              package: AUTH_PACKAGE,
              protoPath: resolve(__dirname, '../../proto/auth.proto'),
            },
          };
        },
      },
      {
        name: USER_CLIENT,
        inject: [EnvService, CircuitBreaker],
        useFactory({ GRPC }: EnvService, breaker: CircuitBreaker) {
          return {
            transport: Transport.GRPC,
            options: {
              channelOptions: {
                interceptors: [breaker.intercept(USER_CLIENT)],
              },
              url: GRPC.USER_SERVICE,
              package: USER_PACKAGE,
              protoPath: resolve(__dirname, '../../proto/user.proto'),
            },
          };
        },
      },
    ]),
  ],
  providers: [GrpcService],
  exports: [GrpcService],
})
@Global()
export class GrpcModule {}
