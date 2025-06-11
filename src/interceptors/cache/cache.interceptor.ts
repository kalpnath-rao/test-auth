import {
  Injectable,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import {
  CACHE_METADATA,
  CLEAR_CACHE_METADATA,
  ICacheConfig,
  IClearConfig,
} from '@decorators/cache.decorator';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { CacheService } from '@shared/cache';
import { ApiException } from '@app/api/api.exception';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CacheInterceptor {
  @Inject(CACHE_MANAGER) cacheManager!: Cache;
  constructor(
    private $reflector: Reflector,
    private $cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Promise<Observable<unknown>> {
    let req: Request;

    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      req = gqlContext.getContext().req;
    }
    if (req) {
      const userId = req.user?.id;
      const url = req.originalUrl || req.url;
      const clearConfig = this.$reflector.get<IClearConfig>(
        CLEAR_CACHE_METADATA,
        context.getHandler(),
      );

      if (clearConfig) {
        return next.handle().pipe(
          tap(async () => {
            if (clearConfig.tag) {
              await this.#removeCache(
                clearConfig.tag,
                userId,
                clearConfig.global,
              );
            } else {
              ApiException.badImplementation('Please Provide Tag');
            }
          }),
        );
      }

      const config = this.$reflector.get<ICacheConfig>(
        CACHE_METADATA,
        context.getHandler(),
      );

      if (!config?.tag) {
        return next.handle();
      }

      const cache = await this.#getCache(
        config.tag,
        userId,
        url,
        config.global,
      );

      if (cache) {
        return of(JSON.parse(cache));
      }

      return next.handle().pipe(
        tap(async (res: object) => {
          const ttl = this.$reflector.get(
            CACHE_TTL_METADATA,
            context.getHandler(),
          );
          if (config.tag) {
            await this.#setCache(
              res,
              config.tag,
              ttl,
              userId,
              url,
              config.global,
            );
          }
        }),
      );
    }
    return next.handle();
  }

  async #setCache(
    result: object,
    tag: string,
    ttl: number,
    userId: string,
    url: string,
    global: boolean,
  ) {
    await this.$cacheService.setApiCache(
      JSON.stringify(result),
      tag,
      ttl,
      userId,
      url,
      global,
    );
  }

  async #getCache(key: string, userId: string, url: string, global: boolean) {
    const cache = await this.$cacheService.getApiCache(
      key,
      userId,
      url,
      global,
    );
    return cache;
  }

  #removeCache(tag: string, userId: string, global: boolean) {
    return this.$cacheService.clearApiCache(tag, userId, global);
  }
}
