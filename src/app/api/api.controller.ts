import { Get, Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiHeaders } from '@nestjs/swagger';
import { COMMON_HEADERS, CacheClearDto } from './api.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiException } from './api.exception';
import { AppLogger } from '../../app/shared/logger';

@Controller({
  path: 'test',
})
@ApiHeaders(COMMON_HEADERS)
export class ApiController {
  constructor(
    @Inject(CACHE_MANAGER) private $cache: Cache,
    @Inject(AppLogger) private logger: AppLogger,
  ) {}

  @Get()
  ping(): string {
    return 'working fine';
  }

  @Post('clear-cache')
  async clearCacheByTags(@Body() body: CacheClearDto): Promise<null> {
    try {
      await Promise.all(body.keys.map((key) => this.$cache.del(key)));
      return null;
    } catch (error) {
      this.logger.error(error, 'Error in clearCacheByTags');
      ApiException.badData('COMMON.REDIS');
    }
  }
}
