import { Module } from '@nestjs/common';
import { GoogleAuthUtil } from './google-auth.util';
import { EnvModule } from '@shared/env';

@Module({
  imports: [EnvModule],
  providers: [GoogleAuthUtil],
  exports: [GoogleAuthUtil],
})
export class GoogleAuthModule {}
