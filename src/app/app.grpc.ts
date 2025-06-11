import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { grpcRequestDto, ProfileDetail } from './app.dto';

@Controller()
export class AccountGRPC {
  constructor(private appService: AppService) {}

  @GrpcMethod('AuthService', 'getProfile')
  async getProfile(payload: grpcRequestDto): Promise<ProfileDetail> {
    console.info('Grpc getProfile method call inside Auth Service');
    return await this.appService.getDemoGrpcDetail(payload);
  }
}
