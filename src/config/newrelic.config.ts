import { IsOptional, IsString } from 'class-validator';

export class NewRelicConfig {
  @IsOptional()
  @IsString()
  readonly APP_NAME?: string;
  @IsOptional()
  @IsString()
  readonly LICENSE?: string;
}
