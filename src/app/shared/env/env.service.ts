import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/index';

@Injectable()
export class EnvService {
  readonly PORT = this.get('PORT');
  readonly NODE_ENV = this.get('NODE_ENV');
  readonly SALT_ROUND = this.get('SALT_ROUND');
  readonly MONGO = this.get('MONGO');
  readonly REDIS = this.get('REDIS');
  readonly KAFKA = this.get('KAFKA');
  readonly SECRETS = this.get('SECRETS');
  readonly AUTH = this.get('AUTH');
  readonly GRPC = this.get('GRPC');
  readonly GCP = this.get('GCP');
  readonly OTP_BYPASS = this.get('OTP_BYPASS');
  readonly CUSTOMER = this.get('CUSTOMER');
  readonly ALLOWED_EMAILS = this.get('ALLOWED_EMAILS');
  readonly GOOGLE = this.get('GOOGLE');
  constructor(private config: ConfigService<EnvConfig, true>) {}
  get<Key extends keyof EnvConfig>(key: Key): EnvConfig[Key] {
    return this.config.get(key);
  }
}
