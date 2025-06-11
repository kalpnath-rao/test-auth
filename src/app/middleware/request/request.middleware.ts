import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppLogger } from '../../shared/logger';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  constructor(public logger: AppLogger) {}
  use(req: Request, res: Response, next: NextFunction): void {
    this.logger.request(req, res);
    next();
  }
}
