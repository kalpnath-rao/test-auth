/// <reference lib="node" />
/* eslint-disable no-var */
export {};

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      SALT_ROUND: string;
    }
  }
  var formatEnum: (t: object) => string;
  var e: (str: string) => string;
}
