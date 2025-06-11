import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_METADATA = Symbol.for('DI:TIMEOUT');

export const Timeout = (ms: number): MethodDecorator =>
  SetMetadata(TIMEOUT_METADATA, ms);
