import { Module, forwardRef } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { LoggerModule } from '@shared/logger';
import { TokenModule } from '@shared/token';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginHistory, LoginHistorySchema } from './schema';
import { AccountModule } from '@api/account';
import { SessionResolver } from './session.resolver';

@Module({
  imports: [
    TokenModule,
    forwardRef(() => AccountModule),
    MongooseModule.forFeature([
      { name: LoginHistory.name, schema: LoginHistorySchema },
    ]),
    LoggerModule.register({
      context: SessionModule.name,
    }),
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionResolver],
  exports: [SessionService],
})
export class SessionModule {}
