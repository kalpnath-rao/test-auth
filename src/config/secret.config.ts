import { Expose, Transform } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class SecretConfig {
  @IsDefined()
  @IsString()
  PASSWORD_TOKEN: string;
  @IsDefined()
  @IsString()
  REFRESH_TOKEN: string;
  @IsDefined()
  @IsString()
  AUTH_TOKEN: string;
  @IsDefined()
  @IsString()
  MFA_TOKEN: string;

  @Expose()
  @Transform(() =>
    readFileSync(resolve(__dirname, '../../secrets/jwt-private.pem'), 'utf8'),
  )
  PRIVATE_KEY: string;
  @Expose()
  @Transform(() =>
    readFileSync(resolve(__dirname, '../../secrets/jwt-public.pem'), 'utf8'),
  )
  PUBLIC_KEY: string;
}
