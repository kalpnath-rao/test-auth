import { IsArray, IsDefined, IsString, IsOptional } from 'class-validator';

export class KafkaConfig {
  @IsDefined()
  @IsArray()
  readonly BROKERS: string[];
  @IsDefined()
  @IsString()
  readonly GROUP_ID: string;
  @IsDefined()
  @IsString()
  readonly CLIENT_ID: string;
  @IsOptional()
  @IsString()
  readonly SASL_USERNAME?: string;
  @IsOptional()
  @IsString()
  readonly SASL_PASSWORD?: string;
}
