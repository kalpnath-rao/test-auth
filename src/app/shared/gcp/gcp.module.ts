import { Module } from '@nestjs/common';
import { GCSService } from './gcp.service';

@Module({
  providers: [GCSService],
  exports: [GCSService],
})
export class GCPModule {}
