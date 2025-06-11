import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LoggerModule } from '@shared/logger';
import { GCPModule } from '@app/shared/gcp/gcp.module';
import { StorageResolver } from './storage.resolver';

@Module({
  imports: [
    LoggerModule.register({
      context: StorageModule.name,
    }),
    GCPModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, StorageResolver],
  exports: [StorageService],
})
export class StorageModule {}
