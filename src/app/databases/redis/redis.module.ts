import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvService } from '@shared/env';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'REDIS_DB',
        inject: [EnvService],
        useFactory({ REDIS }: EnvService) {
          return {
            transport: Transport.REDIS,
            options: {
              host: REDIS.HOST,
              port: REDIS.PORT,
              db: REDIS.DB ?? 0,
            },
          };
        },
      },
    ]),
  ],
})
export class RedisModule {}
