import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AccountModule } from './account';
import { StorageModule } from './storage/storage.module';
import { TokenModule } from '../shared/token/token.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from 'src/interceptors/transform/transform.interceptor';
import { SessionModule } from './session';
import { VerificationModule } from './verification';
import { CacheInterceptor } from 'src/interceptors/cache/cache.interceptor';
import { PasswordModule } from './password/password.module';
import { LoggerModule } from '@app/shared/logger';

@Module({
  imports: [
    TokenModule,
    AccountModule,
    SessionModule,
    PasswordModule,
    StorageModule,
    VerificationModule,
    LoggerModule.register({
      context: ApiModule.name,
    }),
  ],
  controllers: [ApiController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ApiModule {}
