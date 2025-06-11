import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export const SUCCESS_MSG = 'SUCCESS_MSG';
export const CACHE_METADATA = Symbol.for('METADATA.SET_CACHE');
export const CLEAR_CACHE_METADATA = Symbol.for('METADATA.CLEAR_CACHE');

export interface IHelpers {
  createSignedUrl(path: string): string;
}

export interface ICacheConfig {
  tag: string;
  global?: boolean;
  factory?: (url: URL, req: Request) => string | URL;

  transform?: (result: unknown, helpers: IHelpers) => Promise<void> | void;
}

export interface IClearConfig {
  /** If Cache for all users or not */
  global?: boolean;
  /** Used to clear cache data */
  tag: string;
  /** Factory function to create unique key */
  factory?: (url: URL, req: Request) => URL | string;
}

export const Cache = (config: ICacheConfig): MethodDecorator =>
  SetMetadata(CACHE_METADATA, config);

export const ClearCache = (config: IClearConfig): MethodDecorator =>
  SetMetadata(CLEAR_CACHE_METADATA, config);
