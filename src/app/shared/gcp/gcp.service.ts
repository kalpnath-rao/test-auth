import { Injectable } from '@nestjs/common';
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { join } from 'path';
import { EnvService } from '../env';
import { SIGNED_URL_EXPIRY } from './gcp.constants';

@Injectable()
export class GCSService {
  private storage: Storage;
  private bucketName: string;
  constructor(private readonly envService: EnvService) {
    this.storage = new Storage({
      keyFilename: join(process.cwd(), this.envService.GCP.GCP_KEYFILE_PATH),
    });
    this.bucketName = this.envService.GCP.BUCKET_NAME;
  }

  async generateSignedUrl(path: string, action = 'write'): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(path);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: action as GetSignedUrlConfig['action'],
      expires: Date.now() + SIGNED_URL_EXPIRY,
    });

    return url;
  }
}
