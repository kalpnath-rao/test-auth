import { IsString } from 'class-validator';

export class DeepLinkConfig {
  // @IsDefined()
  @IsString()
  readonly ADMIN_URI: string;
  // @IsDefined()
  @IsString()
  readonly WEB_URI: string;
}
