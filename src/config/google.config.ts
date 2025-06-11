import { IsDefined, IsString } from 'class-validator';

export class GoogleConfig {
  @IsDefined()
  @IsString()
  readonly CLIENT_ID: string;

  @IsDefined()
  @IsString()
  readonly CLIENT_SECRET: string;

  @IsDefined()
  @IsString()
  readonly REDIRECT_URI: string;
}
