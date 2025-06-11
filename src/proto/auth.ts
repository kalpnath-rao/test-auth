/* eslint-disable */
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from './google/protobuf/empty';

export const protobufPackage = 'Accelerator.Auth';

export interface Account {
  id: string;
}

export interface ProfileDetail {
  msg: string;
}

export interface AuthVersion {
  tag: string;
}

export const ACCELERATOR__AUTH_PACKAGE_NAME = 'Accelerator.Auth';

export interface AuthServiceClient {
  version(request: Empty, metadata?: Metadata): Observable<AuthVersion>;

  getProfile(request: Account, metadata?: Metadata): Observable<ProfileDetail>;
}

export interface AuthServiceController {
  version(
    request: Empty,
    metadata?: Metadata,
  ): Promise<AuthVersion> | Observable<AuthVersion> | AuthVersion;

  getProfile(
    request: Account,
    metadata?: Metadata,
  ): Promise<ProfileDetail> | Observable<ProfileDetail> | ProfileDetail;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['version', 'getProfile'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('AuthService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('AuthService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const AUTH_SERVICE_NAME = 'AuthService';
