import { IsDefined, IsString } from 'class-validator';

export class GrpcConfig {
  @IsDefined()
  @IsString()
  readonly AUTH_SERVICE: string;
  @IsDefined()
  @IsString()
  readonly USER_SERVICE: string;
}
