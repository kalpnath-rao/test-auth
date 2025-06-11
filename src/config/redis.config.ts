import { Expose, Transform } from 'class-transformer';
import { IsDefined, IsNumber, IsString, IsOptional } from 'class-validator';

export class RedisConfig {
  @IsDefined()
  @IsString()
  readonly HOST: string;
  @IsDefined()
  @IsNumber()
  readonly PORT: number;
  @IsDefined()
  @IsNumber()
  readonly DB: number;
  @IsDefined()
  @IsNumber()
  readonly CACHE_TTL: number;
  @IsDefined()
  @IsNumber()
  readonly MAX_ITEM_IN_CACHE: number;
  @IsOptional()
  @IsString()
  readonly PASSWORD?: string;
  @Expose()
  @Transform(
    ({ obj }: { obj: RedisConfig }) => `redis://${obj.HOST}:${obj.PORT}`,
  )
  readonly URI: string;
}
