import { Module } from '@nestjs/common';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { TokenModule } from '@shared/token';
import { LoggerModule } from '@shared/logger';
import { MongooseModule } from '@nestjs/mongoose';
import { Password, PasswordSchema } from './schema/password.schema';
import { CacheModule } from '@shared/cache';
import { AccountModule } from '../account';
import { VerificationModule } from '../verification';
import { PasswordResolver } from './password.resolver';

@Module({
  imports: [
    TokenModule,
    CacheModule,
    AccountModule,
    VerificationModule,
    LoggerModule.register({
      context: PasswordModule.name,
    }),
    MongooseModule.forFeature([
      {
        name: Password.name,
        schema: PasswordSchema,
      },
    ]),
  ],
  controllers: [PasswordController],
  providers: [PasswordService, PasswordResolver],
})
export class PasswordModule {}
