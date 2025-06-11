import { SetMetadata } from '@nestjs/common';

export const ROLES = Symbol.for('ROLES');

export const Role = (...roles: string[]): MethodDecorator =>
  SetMetadata(ROLES, roles);
