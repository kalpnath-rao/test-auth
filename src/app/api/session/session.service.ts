import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { TokenService } from '@shared/token';
import { CacheService } from '@shared/cache';
import { InjectModel } from '@nestjs/mongoose';
import { LoginHistory } from './schema';
import { Model } from 'mongoose';
import { AccountService } from '@api/account';
import { ProducerService } from '@app/kafka';

@Injectable()
export class SessionService {
  constructor(
    private $tokenService: TokenService,
    private $cacheService: CacheService,
    @InjectModel(LoginHistory.name)
    private $LoginHistoryModel: Model<LoginHistory>,
    @Inject(forwardRef(() => AccountService))
    private $accountService: AccountService,
    private readonly $producerService: ProducerService,
  ) {}
  async create(data: CreateDto): Promise<{
    authToken: string;
    refreshToken: string;
    mfaToggleEnable: boolean;
  }> {
    const history = await this.$LoginHistoryModel.create({
      account: data.id,
    });
    const payload = {
      tid: history._id.toHexString(),
      typ: data.type,
      aid: data.id,
    };
    return {
      authToken: this.$tokenService.genAuthToken(payload),
      refreshToken: this.$tokenService.genRefreshToken(payload),
      mfaToggleEnable: data.mfaToggleEnable,
    };
  }

  async logout(token: IToken, id: string): Promise<void> {
    await this.$producerService.logout({ id });
    await this.$cacheService.expireAccount(token.id, new Date());
  }
  /** Generate Auth Token */
  async refresh(user: IUser): Promise<string> {
    const permissions = await this.$accountService.permissions(user.id);
    if (permissions) {
      await this.$cacheService.permissionStore(user.id, permissions);
    }
    return Promise.resolve(
      this.$tokenService.genAuthToken({
        tid: user.token.id,
        typ: user.type,
        aid: user.id,
      }),
    );
  }
  /** Generate Access Token */
  async generate(user: IUser): Promise<string> {
    const permissions = await this.$accountService.permissions(user.id);
    return this.$tokenService.genAccessToken({
      tid: user.token.id,
      typ: user.type,
      aid: user.id,
      prms: permissions,
    });
  }
}
