import { Module, NestModule, OnApplicationShutdown } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { MongoDatabaseModule } from './databases/mongodb/mongodb.module';
import { RedisModule } from './databases/redis/redis.module';
import { ApiModule } from './api/api.module';
import * as path from 'path';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { EnvModule } from './shared/env/env.module';
import { AccountModule } from './api/account/account.module';
import { LoggerModule } from './shared/logger/logger.module';
import { CacheModule } from './shared/cache';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from './shared/token/token.module';
import { KafkaModule } from './kafka/kafka.module';
import { AppService } from './app.service';
import { GrpcModule } from './grpc';
import {
  AuthStrategy,
  BasicStrategy,
  MFAStrategy,
  PasswordStrategy,
  RefreshStrategy,
} from './guards';
import { AccountGRPC } from './app.grpc';
import { EnvService } from './shared/env';

import { ClsModule } from 'nestjs-cls';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationInterceptor } from 'src/interceptors/correlation.interceptor';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GCPModule } from './shared/gcp/gcp.module';

@Module({
  imports: [
    EnvModule,
    AccountModule,
    TokenModule,
    ConfigModule.forRoot({
      isGlobal: true, // Use module globally
      cache: true, //Cache environment variables
    }),
    MongoDatabaseModule,
    RedisModule,
    GrpcModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve(__dirname, '../../i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    CacheModule,
    PassportModule,
    GCPModule,
    LoggerModule.register({
      context: AppModule.name,
    }),
    KafkaModule.registerAsync({
      useFactory({ KAFKA }: EnvService) {
        return {
          brokers: KAFKA.BROKERS,
          groupId: KAFKA.GROUP_ID,
          clientId: KAFKA.CLIENT_ID,
          sasl: {
            username: KAFKA.SASL_USERNAME,
            password: KAFKA.SASL_PASSWORD,
          },
        };
      },
      imports: [EnvModule],
      inject: [EnvService],
    }),
    ApiModule,
    ClsModule.forRoot({
      global: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // or path to .gql
      context: ({ req, res }) => ({ req, res }),
      formatError: (error) => {
        const originalError = error.extensions?.originalError;
        if (!originalError) {
          return {
            message: error.message,
            code: error.extensions?.code,
          };
        }

        return {
          message: originalError['message'],
          code: originalError['statusCode'],
        };
      },
    }),
  ],

  controllers: [AppController, AccountGRPC],
  providers: [
    AppService,
    MFAStrategy,
    BasicStrategy,
    AuthStrategy,
    RefreshStrategy,
    PasswordStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
  ],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  configure(): void {}

  onApplicationShutdown(): void {
    console.log('Application closed');
  }
}
