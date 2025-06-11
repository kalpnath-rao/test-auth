export interface MfaTokenPayload {
  aid: string;
}

export interface TokenPayload {
  /** Token ID */
  tid: string;
  /** Scope Type */
  typ: string;
  /** Account ID */
  aid: string;
  prms: Record<string, string[]>;
}
