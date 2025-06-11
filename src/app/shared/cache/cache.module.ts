import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { LoggerModule } from '@shared/logger';
import { EnvService } from '@shared/env';
import { Keyv } from 'keyv';
import { createKeyv } from '@keyv/redis';
import { CacheModule as NativeCacheModule } from '@nestjs/cache-manager';
import { CacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    LoggerModule.register({
      context: CacheModule.name,
    }),
    NativeCacheModule.registerAsync({
      isGlobal: true,
      inject: [EnvService],
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
          ],
        };
      },
    }),
  ],
  providers: [
    CacheService,
    {
      provide: Keyv,
      useFactory: ({ REDIS }: EnvService) =>
        createKeyv({
          url: `redis://${REDIS.HOST}:${REDIS.PORT}/${REDIS.DB ?? 0}`,
          password: REDIS.PASSWORD,
        }),
      inject: [EnvService],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
