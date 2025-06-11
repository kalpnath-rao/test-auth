import { AppLogger } from '@app/shared/logger';
import { Injectable } from '@nestjs/common';
import { GCSService } from '@app/shared/gcp/gcp.service';
import { FileNamePrefix, SignedUrlAction } from './storage.constants';
import { UploadDir } from './storage.constants';
import { GCPSignedUrlInput } from './dto/upload.input';
import { GCPSignedUrlOutput } from './dto/upload.output';

@Injectable()
export class StorageService {
  constructor(
    private $logger: AppLogger,
    private readonly gcpService: GCSService,
  ) {}

  async generateUploadSignedUrl({
    action,
    extension,
  }: GCPSignedUrlInput): Promise<GCPSignedUrlOutput> {
    try {
      const name = `${FileNamePrefix[action]}${Date.now()}.${extension}`;
      const path = `${UploadDir[action]}/${name}`;
      const url = await this.gcpService.generateSignedUrl(
        path,
        SignedUrlAction.WRITE,
      );
      return { url, name, path };
    } catch (error) {
      this.$logger.error(
        `Error during generate upload signed url: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
