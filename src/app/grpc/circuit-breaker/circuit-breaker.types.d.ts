import { Client as BaseClient, requestCallback } from '@grpc/grpc-js';

export interface BreakerConfig {
  /**
   * How many failures do we allow before moving to RED state?
   * @Default 10
   */
  failureThreshold?: number;
  /**
   * How many successes do we need before moving to GREEN state?
   * @Default 10
   */
  successThreshold?: number;
  /**
   * Once we are in RED state, how much time(MilliSeconds) should we wait before we allow a request to pass through?
   * @Default 60 * 1000 (60 Seconds)
   */
  timeout?: number;
}

export type Command<Client extends BaseClient> = Exclude<
  keyof Client,
  keyof BaseClient
>;

export type Args<
  Client extends BaseClient,
  K extends keyof Client,
> = Client[K] extends (...args: infer P) => unknown ? P : never;

export type Result<Client extends BaseClient, K extends keyof Client> =
  Args<Client, K> extends (infer I)[]
    ? I extends requestCallback<infer R>
      ? R
      : never
    : never;
