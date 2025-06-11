import { IsDefined, IsString } from 'class-validator';

export class GcpConfig {
  @IsDefined()
  @IsString()
  readonly BUCKET_NAME: string;

  @IsDefined()
  @IsString()
  readonly GCP_KEYFILE_PATH: string;
}
