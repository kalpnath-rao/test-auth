/* eslint-disable */
import { Metadata } from '@grpc/grpc-js';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Empty } from './google/protobuf/empty';

export const protobufPackage = 'Accelerator.User';

export interface DeleteReq {
  id: string;
}

export interface Ids {
  id: string[];
}

export interface AdminData {
  id: string;
  name: string;
  adminId: string;
}

export interface GetAdminData {
  adminData: AdminData[];
}

export interface MVRData {
  id: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  licenseNumber: string;
  vehicleType: number;
  ssn: string;
}

export interface UserVersion {
  tag: string;
}

export interface DriverVerification {
  id: string;
}

export interface GetDriverVerificationStatus {
  onboardingSteps: number;
  bgvStatus: string;
  mvrStatus: string;
  idvStatus: string;
}

export interface Name {
  first: string;
  last?: string | undefined;
}

export interface City {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface DriverData {
  id: string;
}

export interface GetDriverData {
  onboardingSteps: number;
  bgvStatus: string;
  mvrStatus: string;
  idvStatus: string;
  name: Name | undefined;
  avatar: string;
  workingCity: City | undefined;
  workingState: State | undefined;
  workingCountry: Country | undefined;
}

export interface CustomerData {
  id: string;
}

export interface GetCustomerData {
  name: Name | undefined;
  avatar: string;
  rating: number;
}

export interface ActiveAdminsExistInZoneReq {
  zoneId: string;
}

export interface ActiveAdminsExistInZoneRes {
  activeAdminExists: boolean;
}

export interface AdminDetailsForZoneDescReq {
  zoneId: string;
  adminIds: string[];
}

export interface AdminDetailsForZoneDescRes {
  count: number;
  adminNames: AdminData[];
}

export const ACCELERATOR__USER_PACKAGE_NAME = 'Accelerator.User';

export interface UserServiceClient {
  version(request: Empty, metadata?: Metadata): Observable<UserVersion>;

  initiateMvr(request: MVRData, metadata?: Metadata): Observable<Empty>;

  driverVerificationData(
    request: DriverVerification,
    metadata?: Metadata,
  ): Observable<GetDriverVerificationStatus>;

  driverData(
    request: DriverData,
    metadata?: Metadata,
  ): Observable<GetDriverData>;

  customerData(
    request: CustomerData,
    metadata?: Metadata,
  ): Observable<GetCustomerData>;

  adminData(request: Ids, metadata?: Metadata): Observable<GetAdminData>;

  activeAdminsExistInZone(
    request: ActiveAdminsExistInZoneReq,
    metadata?: Metadata,
  ): Observable<ActiveAdminsExistInZoneRes>;

  adminDetailsForZoneDesc(
    request: AdminDetailsForZoneDescReq,
    metadata?: Metadata,
  ): Observable<AdminDetailsForZoneDescRes>;

  deleteDriver(request: DeleteReq, metadata?: Metadata): Observable<Empty>;

  deleteCustomer(request: DeleteReq, metadata?: Metadata): Observable<Empty>;
}

export interface UserServiceController {
  version(
    request: Empty,
    metadata?: Metadata,
  ): Promise<UserVersion> | Observable<UserVersion> | UserVersion;

  initiateMvr(request: MVRData, metadata?: Metadata): void;

  driverVerificationData(
    request: DriverVerification,
    metadata?: Metadata,
  ):
    | Promise<GetDriverVerificationStatus>
    | Observable<GetDriverVerificationStatus>
    | GetDriverVerificationStatus;

  driverData(
    request: DriverData,
    metadata?: Metadata,
  ): Promise<GetDriverData> | Observable<GetDriverData> | GetDriverData;

  customerData(
    request: CustomerData,
    metadata?: Metadata,
  ): Promise<GetCustomerData> | Observable<GetCustomerData> | GetCustomerData;

  adminData(
    request: Ids,
    metadata?: Metadata,
  ): Promise<GetAdminData> | Observable<GetAdminData> | GetAdminData;

  activeAdminsExistInZone(
    request: ActiveAdminsExistInZoneReq,
    metadata?: Metadata,
  ):
    | Promise<ActiveAdminsExistInZoneRes>
    | Observable<ActiveAdminsExistInZoneRes>
    | ActiveAdminsExistInZoneRes;

  adminDetailsForZoneDesc(
    request: AdminDetailsForZoneDescReq,
    metadata?: Metadata,
  ):
    | Promise<AdminDetailsForZoneDescRes>
    | Observable<AdminDetailsForZoneDescRes>
    | AdminDetailsForZoneDescRes;

  deleteDriver(request: DeleteReq, metadata?: Metadata): void;

  deleteCustomer(request: DeleteReq, metadata?: Metadata): void;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'version',
      'initiateMvr',
      'driverVerificationData',
      'driverData',
      'customerData',
      'adminData',
      'activeAdminsExistInZone',
      'adminDetailsForZoneDesc',
      'deleteDriver',
      'deleteCustomer',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('UserService', method)(
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
      GrpcStreamMethod('UserService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const USER_SERVICE_NAME = 'UserService';
