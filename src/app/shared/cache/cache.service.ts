import { Inject, Injectable } from '@nestjs/common';
import { TTL } from '@app/app.constants';
import Keyv from 'keyv';
import { EnvService } from '@shared/env';
@Injectable()
export class CacheService {
  #CACHE_PREFIX = this.$envService.NODE_ENV;
  constructor(
    @Inject(Keyv) private readonly keyv: Keyv,
    private readonly $envService: EnvService,
  ) {}

  async expireAccount(account: string, expiredAt = new Date()): Promise<void> {
    const key = `EXPIRED_ACCOUNT_${account}`;
    const spent = expiredAt.getTime() - Date.now();
    const ttl = TTL.NEVER * 1000 - spent;
    await this.keyv.set(key, expiredAt.toISOString(), ttl);
  }

  async blockToken(tid: string, expiredAt: Date): Promise<void> {
    const key = `EXPIRED_TOKEN_${tid}`;
    const spent = expiredAt.getTime() - Date.now();
    const ttl = TTL.REFRESH_TOKEN * 1000 - spent;
    await this.keyv.set(key, 1, ttl);
  }

  async isTokenBlocked(tid: string, aid: string, iat: Date): Promise<boolean> {
    const [token, blockedAtStr] = await Promise.all([
      this.keyv.get<number>(`EXPIRED_TOKEN_${tid}`),
      this.keyv.get<string>(`EXPIRED_ACCOUNT_${aid}`),
    ]);
    const blockedAt = blockedAtStr ? new Date(blockedAtStr) : null;
    return !!token || !!(blockedAt && blockedAt > iat);
  }

  async permissionStore(
    id: string,
    permissions: Record<string, string[]>,
  ): Promise<void> {
    const key = `PERMISSION_${id}`;
    await this.keyv.set(key, JSON.stringify(permissions), 86400000 * 365);
  }

  async markExhausted(key: string, expiry: number): Promise<void> {
    await this.keyv.set(`EXHAUSTED_${key}`, 1, expiry);
  }

  async isExhausted(key: string): Promise<boolean> {
    const result = await this.keyv.get<number>(`EXHAUSTED_${key}`);
    return !!result;
  }

  // These methods simulate a hash-like behavior using object storage.
  async setApiCache(
    result: string,
    tag: string,
    ttl: number,
    userId: string,
    url: string,
    global: boolean = false,
  ): Promise<void> {
    let key = this.redisKeyGenerator(tag, global, userId);
    const existing = (await this.keyv.get<Record<string, string>>(key)) || {};
    existing[url] = result;
    await this.keyv.set(key, existing, ttl);
  }

  async getApiCache(
    tag: string,
    userId: string,
    url: string,
    global: boolean = false,
  ): Promise<string | undefined> {
    const key = this.redisKeyGenerator(tag, global, userId);
    const cache = (await this.keyv.get<Record<string, string>>(key)) || {};
    return cache[url];
  }

  async clearApiCache(
    tag: string,
    userId: string,
    global: boolean = false,
  ): Promise<void> {
    const key = this.redisKeyGenerator(tag, global, userId);
    await this.keyv.delete(key);
  }

  redisKeyGenerator(tag: string, global: boolean, userId: string): string {
    return global
      ? `${this.#CACHE_PREFIX}_${tag}`
      : `${this.#CACHE_PREFIX}_${tag}_${userId}`;
  }
}
