import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from '../env/index';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      async useFactory({ SECRETS }: EnvService) {
        return {
          publicKey: SECRETS.PUBLIC_KEY,
          privateKey: SECRETS.PRIVATE_KEY,
          signOptions: { expiresIn: 300 },
        };
      },
      inject: [EnvService],
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
