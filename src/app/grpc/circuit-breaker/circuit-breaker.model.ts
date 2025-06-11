import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { BreakerState } from './circuit-breaker.constants';

export class BreakerStateData {
  #state: BreakerState = BreakerState.GREEN;
  #failureCount = 0;
  #successCount = 0;
  #nextAttempt = 0;
  constructor(public command: string = 'Service') {}
  checkHealth(): void {
    if (this.#state === BreakerState.RED) {
      if (this.#nextAttempt <= Date.now()) {
        this.#state = BreakerState.YELLOW;
      } else {
        throw new RpcException({
          code: status.ABORTED,
          message: `${this.command} circuit suspended. You shall not pass.`,
        });
      }
    }
  }
  analyzeSuccess(threshold: number): void {
    this.#failureCount = 0;
    if (this.#state === BreakerState.YELLOW) {
      this.#successCount++;

      if (this.#successCount > threshold) {
        this.#successCount = 0;
        this.#state = BreakerState.GREEN;
      }
    }
    this.#log('Success');
  }

  analyzeFailure(threshold: number, timeout: number): void {
    this.#failureCount++;

    if (this.#failureCount >= threshold) {
      this.#state = BreakerState.RED;

      this.#nextAttempt = Date.now() + timeout;
    }
    this.#log('Failure');
  }
  #log(result: string): void {
    console.info(result, {
      data: {
        Result: result,
        Command: this.command,
        Timestamp: Date.now(),
        Successes: this.#successCount,
        Failures: this.#failureCount,
        State: this.#state,
      },
    });
  }
}
