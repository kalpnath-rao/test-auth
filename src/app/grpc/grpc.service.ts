import { Inject, Injectable } from '@nestjs/common';
import { AUTH_CLIENT, USER_CLIENT } from './grpc.constants';
import { AUTH_SERVICE_NAME, AuthServiceClient } from './../../proto/auth';
import { ClientGrpc } from '@nestjs/microservices';
import { USER_SERVICE_NAME, UserServiceClient } from '@proto/user';

@Injectable()
export class GrpcService {
  constructor(
    @Inject(AUTH_CLIENT) private authClient: ClientGrpc,
    @Inject(USER_CLIENT) private userClient: ClientGrpc,
  ) {}

  get authService(): AuthServiceClient {
    return this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  get userService(): UserServiceClient {
    return this.userClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }
}
