import { UserType } from '@app/app.constants';
import { Password } from '../schema/password.schema';
import { Types } from 'mongoose';

export type QueryResult = Omit<Password, 'account'> & {
  passwords: string[];
  account?: {
    _id: Types.ObjectId;
    type: UserType;
    name: { first: string; last: string };
    blockedAt?: Date;
    password: string;
  };
};
