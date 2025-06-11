export enum UserType {
  Admin = '1',
  User = '2',
}

export enum Platform {
  Ios = '1',
  Android = '2',
  Web = '3',
}

export enum Language {
  En = 'EN',
  Ar = 'AR',
  Fr = 'FR',
  Es = 'ES',
}

/** In Seconds */
export const TTL = {
  /** 7 Days (In Seconds) */
  REFRESH_TOKEN: 7 * 24 * 60 * 60,
  /** 1 Hour (In Seconds) */
  ACCESS_TOKEN: 60 * 60,
  /** 1 Hour (In Seconds) */
  AUTH_TOKEN: 60 * 60,
  /** 5 Minutes (In Seconds) */
  MFA_TOKEN: 5 * 60,
  /** 3 Hours (In Seconds) */
  PWD_TOKEN: 3 * 60 * 60,
  /** 1 Year (In Seconds) */
  NEVER: 365 * 24 * 60 * 60,
};

export const VALIDATIONS = {
  PHONE_NO: {
    LENGTH: {
      MIN: 6,
      MAX: 14,
    },
  },
  PHONE_CODE: {
    LENGTH: {
      MIN: 2,
      MAX: 6,
    },
  },
  EMAIL: {
    LENGTH: {
      MIN: 3,
      MAX: 320,
    },
  },
  NAME: {
    LENGTH: {
      MIN: 1,
      MAX: 50,
    },
  },
  SOCIAL_ID: {
    LENGTH: {
      MIN: 1,
      MAX: 420,
    },
  },
  OTP: {
    LENGTH: 6,
  },
  PASSWORD: {
    LENGTH: {
      MIN: 8,
      MAX: 15,
    },
  },
};

export enum Timezone {
  Kolkata = 'Asia/Kolkata',
}
