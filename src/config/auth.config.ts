import { IsDefined, IsString } from 'class-validator';

export class AuthConfig {
  @IsDefined()
  @IsString()
  readonly USERNAME: string;
  @IsDefined()
  @IsString()
  readonly PASSWORD: string;
}
