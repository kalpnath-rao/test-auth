import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Message } from './decorators';
import { Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/passwords/:token')
  @ApiExcludeEndpoint()
  @Message('PASSWORD.SUCCESS')
  async verifyPasswordLink(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.appService.checkPasswordTokenExpireTime(token);
      res.redirect(
        // TODO: change link once backend is ready
        `www.google.com`,
      );
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.redirect(
          // TODO: change link once backend is ready
          `www.google.com`,
        );
      } else {
        // TODO: change link once backend is ready
        res.redirect('https://www.google.com?q=malformed');
      }
    }
  }
}
