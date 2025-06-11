import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Verification, VerificationSchema } from './schema/verification.schema';
import { LoggerModule } from '@shared/logger';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Verification.name,
        schema: VerificationSchema,
      },
    ]),
    LoggerModule.register({
      context: VerificationModule.name,
    }),
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
