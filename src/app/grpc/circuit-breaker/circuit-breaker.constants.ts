export const BREAKER_OPTIONS = Symbol.for('DI:BREAKER_OPTIONS');

export enum BreakerState {
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  RED = 'RED',
}
