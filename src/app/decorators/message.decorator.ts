import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const SUCCESS_MSG = 'SUCCESS_MSG';

export type MessageResolver = (req: Request, result: unknown) => string;

export type IMessage = string | MessageResolver;

export const Message = (msg: IMessage): MethodDecorator =>
  SetMetadata(SUCCESS_MSG, msg);
