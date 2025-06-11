import { Expose, Transform } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class MongoConfig {
  @IsDefined()
  @IsString()
  readonly SCHEME!: string;

  @IsDefined()
  @IsString()
  readonly HOST!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly PORT!: number;

  @IsDefined()
  @IsString()
  readonly DATABASE!: string;

  @IsDefined()
  @IsString()
  readonly USERNAME!: string;

  @IsDefined()
  @IsString()
  readonly PASSWORD!: string;

  @Expose()
  @Transform(({ obj }: { obj: MongoConfig }) => {
    let AUTH = '';
    if (obj.USERNAME && obj.PASSWORD) {
      AUTH = `${obj.USERNAME}:${obj.PASSWORD}@`;
    } else if (obj.USERNAME) {
      AUTH = `${obj.USERNAME}@`;
    }
    const PORT = obj.PORT ? `:${obj.PORT}` : '';
    return `${obj.SCHEME}://${AUTH}${obj.HOST}${PORT}/${obj.DATABASE}`;
  })
  readonly URI!: string;
}
