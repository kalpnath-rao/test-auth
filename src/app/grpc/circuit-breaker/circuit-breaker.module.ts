import { DynamicModule, Global, Module } from '@nestjs/common';
import { CircuitBreaker } from './circuit-breaker.service';
import { BREAKER_OPTIONS } from './circuit-breaker.constants';
import { BreakerConfig } from './circuit-breaker.types';

@Module({
  providers: [CircuitBreaker],
  exports: [CircuitBreaker],
})
@Global()
export class CircuitBreakerModule {
  static register(options: BreakerConfig): DynamicModule {
    return {
      global: true,
      module: CircuitBreakerModule,
      providers: [{ provide: BREAKER_OPTIONS, useValue: options }],
    };
  }
}
