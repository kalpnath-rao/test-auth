import { Module, forwardRef } from '@nestjs/common';
import { AccountController } from './account.controller';
import { SessionModule } from '@api/session';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { LoggerModule } from '@shared/logger';
import { AccountService } from './account.service';
import { TokenModule } from '@shared/token/token.module';
import { AccountConsumer } from './account.consumer';
import { VerificationModule } from '../verification/verification.module';
import { AccountResolver } from './account.resolver';
import { GoogleAuthModule } from '@app/shared/auth/google/google-auth.module';
import { AccountAuthService } from './services/account.auth.service';
import { AccountMfaService } from './services/account.mfa.service';
import { AccountSocialService } from './services/account.social.service';
import { AccountLoginService } from './services/account.login.service';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    LoggerModule.register({
      context: AccountModule.name,
    }),
    forwardRef(() => SessionModule),
    forwardRef(() => VerificationModule),
    GoogleAuthModule,
  ],
  controllers: [AccountController, AccountConsumer],
  providers: [
    AccountService,
    AccountResolver,
    AccountAuthService,
    AccountMfaService,
    AccountSocialService,
    AccountLoginService,
  ],
  exports: [
    AccountService,
    AccountAuthService,
    AccountMfaService,
    AccountSocialService,
  ],
})
export class AccountModule {}
