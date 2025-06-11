import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsObject,
  IsString,
  Min,
  ValidateNested,
  IsOptional,
  IsArray,
} from 'class-validator';

import { MongoConfig } from './mongo.config';
import { RedisConfig } from './redis.config';
import { KafkaConfig } from './kafka.config';
import { SecretConfig } from './secret.config';
import { AuthConfig } from './auth.config';
import { GrpcConfig } from './grpc.config';
import { DeepLinkConfig } from './deep-link.config';
import { NewRelicConfig } from './newrelic.config';
import { CustomerConfig } from './customer.config';
import { GcpConfig } from './gcp.config';
import { GoogleConfig } from './google.config';

export class EnvConfig {
  @IsDefined()
  @IsString()
  NODE_ENV!: string;
  @IsDefined()
  @IsNumber()
  @Min(1)
  PORT!: number;
  @IsDefined()
  @IsNumber()
  @Min(1)
  SALT_ROUND!: number;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => MongoConfig)
  MONGO!: MongoConfig;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => RedisConfig)
  REDIS!: RedisConfig;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => KafkaConfig)
  KAFKA!: KafkaConfig;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => AuthConfig)
  AUTH!: AuthConfig;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => SecretConfig)
  SECRETS!: SecretConfig;
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => GrpcConfig)
  GRPC!: GrpcConfig;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => GcpConfig)
  GCP!: GcpConfig;

  // @IsDefined()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeepLinkConfig)
  DEEP_LINK: DeepLinkConfig;
  @IsOptional()
  @IsString()
  OTP_BYPASS!: string;
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NewRelicConfig)
  NEW_RELIC: NewRelicConfig;
  // @IsDefined()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerConfig)
  CUSTOMER: CustomerConfig;

  @IsDefined()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  ALLOWED_EMAILS!: string[];

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleConfig)
  GOOGLE!: GoogleConfig;
}
