import { BlockTime } from '../interfaces/account';

export const MAX_ATTEMPTS = {
  LOGIN: 5,
};

export const BLOCK_TIMES: Record<string, BlockTime> = {
  LOGIN: {
    AMOUNT: 15,
    UNIT: 'minutes',
  },
};

export const CACHE_TTL: Record<string, number> = {
  ONE_DAY: 24 * 60 * 60 * 1000,
};
