/// <reference lib="express" />

import { UserType, Entity, Action } from '@app/app.constants';
import { AggregateOptions, Model, PipelineStage } from 'mongoose';

export {};

declare global {
  export interface IToken {
    id: string;
    issuedAt: Date;
    expiredAt: Date;
    audience: string;
    subject: string;
    issuer: string;
  }
  export interface ISocial {
    type: string;
    id: string;
    name: {
      first: string;
      last: string;
    };
    email: string;
  }
  namespace Express {
    export interface User {
      id: string;
      type: UserType;
      token: IToken;
      secret?: string;
      social?: ISocial;
      email?: any;
      name?: any;
      password?: string;
    }
  }
  type IUser = Express.User;
  type IRequest = Express.Request & Request;
}
