import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppLogger, LoggerModule } from '@shared/logger';
import { EnvService } from '@shared/env';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [EnvService, AppLogger],
      imports: [LoggerModule],
      useFactory: async ({ MONGO }: EnvService, logger: AppLogger) => {
        mongoose.set('debug', true);
        logger.log('Connecting ...', 'MongooseModule');
        return {
          uri: MONGO.URI,
          connectionFactory(connection) {
            logger.log('Connected !', 'MongooseModule');
            connection.on('disconnecting', () => {
              logger.log('Disconnecting ...', 'MongooseModule');
            });
            connection.on('disconnected', () => {
              logger.log('Disconnected !', 'MongooseModule');
            });
            connection.on('reconnected', () => {
              logger.log('Reconnected !', 'MongooseModule');
            });
            connection.on('close', () => {
              logger.log('Closed !', 'MongooseModule');
            });
            connection.on('error', (err) => {
              logger.error(err.message, err.stack, 'MongooseModule');
            });
            return connection;
          },
        };
      },
    }),
  ],
})
export class MongoDatabaseModule {}
