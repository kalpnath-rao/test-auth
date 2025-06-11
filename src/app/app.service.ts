import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './shared/token/token.service';
import { ApiException } from './api/api.exception';
import { grpcRequestDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(
    public configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkPasswordTokenExpireTime(token: string): Promise<void> {
    const isValidatedToken = await this.tokenService.verifyPasswordToken(token);
    if (!isValidatedToken) {
      ApiException.badData('ACCOUNT.INVALID_TOKEN');
    }
    await this.tokenService.getDataFromToken(token);
    return;
  }

  async getDemoGrpcDetail(payload: grpcRequestDto): Promise<{ msg: string }> {
    return { msg: `Hello from ${payload.id}` };
  }
}
