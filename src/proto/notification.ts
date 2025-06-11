/* eslint-disable */
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from './google/protobuf/empty';

export const protobufPackage = 'Accelerator.Notification';

export interface DeleteReq {
  id: string;
}

export interface NotificationVersion {
  tag: string;
}

export const ACCELERATOR__NOTIFICATION_PACKAGE_NAME =
  'Accelerator.Notification';

export interface NotificationServiceClient {
  version(request: Empty, metadata?: Metadata): Observable<NotificationVersion>;

  deleteUser(request: DeleteReq, metadata?: Metadata): Observable<Empty>;
}

export interface NotificationServiceController {
  version(
    request: Empty,
    metadata?: Metadata,
  ):
    | Promise<NotificationVersion>
    | Observable<NotificationVersion>
    | NotificationVersion;

  deleteUser(request: DeleteReq, metadata?: Metadata): void;
}

export function NotificationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['version', 'deleteUser'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('NotificationService', method)(
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
      GrpcStreamMethod('NotificationService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const NOTIFICATION_SERVICE_NAME = 'NotificationService';
