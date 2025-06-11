import { VChannel } from './verification.enum';

export interface ITarget {
  email?: string;
  to?: string;
}

export interface ISendSMS extends ITarget {
  channel: VChannel.SMS;
}

export interface ISendMAIL extends ITarget {
  channel: VChannel.Email;
  name: string;
}

export type TSend = ISendSMS | ISendMAIL;
export interface IVerify extends ITarget {
  otp: string;
}
