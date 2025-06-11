/* eslint-disable */
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from './google/protobuf/empty';

export const protobufPackage = 'Accelerator.Content';

export interface ContentVersion {
  tag: string;
}

export const ACCELERATOR__CONTENT_PACKAGE_NAME = 'Accelerator.Content';

export interface ContentServiceClient {
  version(request: Empty, metadata?: Metadata): Observable<ContentVersion>;
}

export interface ContentServiceController {
  version(
    request: Empty,
    metadata?: Metadata,
  ): Promise<ContentVersion> | Observable<ContentVersion> | ContentVersion;
}

export function ContentServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['version'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('ContentService', method)(
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
      GrpcStreamMethod('ContentService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const CONTENT_SERVICE_NAME = 'ContentService';
