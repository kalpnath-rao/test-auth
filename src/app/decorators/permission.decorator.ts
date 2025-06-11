import { SetMetadata } from '@nestjs/common';

export const SCOPES = Symbol.for('SCOPES');
export const PERMISSIONS = Symbol.for('PERMISSIONS');

export enum Action {
  Add = 'ADD',
  View = 'VIEW',
  Edit = 'EDIT',
  Status = 'STATUS',
  Delete = 'DELETE',
}

export const Scope = (...scopes: string[]): MethodDecorator =>
  SetMetadata(SCOPES, scopes);

export const Permission = (
  permission: string,
  ...actions: Action[]
): MethodDecorator => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const DATA = Reflect.getMetadata(PERMISSIONS, target, propertyKey) ?? {};
    DATA[permission] = actions;
    Reflect.defineMetadata(PERMISSIONS, DATA, target, propertyKey);
    return descriptor;
  };
};
