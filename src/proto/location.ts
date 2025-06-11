/* eslint-disable */
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from './google/protobuf/empty';

export const protobufPackage = 'Accelerator.Location';

export interface LocationVersion {
  tag: string;
}

export const ACCELERATOR__LOCATION_PACKAGE_NAME = 'Accelerator.Location';

export interface LocationServiceClient {
  version(request: Empty, metadata?: Metadata): Observable<LocationVersion>;
}

export interface LocationServiceController {
  version(
    request: Empty,
    metadata?: Metadata,
  ): Promise<LocationVersion> | Observable<LocationVersion> | LocationVersion;
}

export function LocationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['version'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('LocationService', method)(
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
      GrpcStreamMethod('LocationService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const LOCATION_SERVICE_NAME = 'LocationService';
