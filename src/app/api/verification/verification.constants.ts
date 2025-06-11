import { BlockTime } from './interfaces/verification';

/** Time (In Minutes) */
export const OTP_EXPIRE_TIME = 10;

/** Interval Time (In Seconds) */
export const RESEND_INTERVAL = 15;

/** Time (In Minutes) */
export const BLOCK_TIME = 15;

export const MAX_ATTEMPTS = 5;

export const BLOCK_TIMES: Record<string, BlockTime> = {
  VERIFICATION: {
    AMOUNT: 5,
    UNIT: 'minutes',
  },
};
