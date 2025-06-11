import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { IMessage, SUCCESS_MSG } from '@decorators/message.decorator';
import { I18nService } from 'nestjs-i18n';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

@Injectable()
export class TransformInterceptor implements NestInterceptor<unknown> {
  constructor(
    private $reflector: Reflector,
    private i18n: I18nService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map((result) => {
          if (result instanceof StreamableFile) {
            return result;
          }
          let MSG_CODE = this.$reflector.get<IMessage>(
            SUCCESS_MSG,
            context.getHandler(),
          );
          const statusCode =
            this.$reflector.get<number>(
              HTTP_CODE_METADATA,
              context.getHandler(),
            ) ?? 200;
          const res = context.switchToHttp().getResponse();
          // Ensure res.status is available
          if (typeof res.status === 'function') {
            res.status(statusCode);
          }
          // context.switchToHttp().getResponse().status(statusCode);
          let message = 'Success';
          if (MSG_CODE) {
            if (typeof MSG_CODE === 'function') {
              MSG_CODE = MSG_CODE(context.switchToHttp().getRequest(), result);
            }
            const { i18nLang } = context.switchToHttp().getRequest();
            const msg = this.i18n.translate(MSG_CODE as string, {
              lang: i18nLang,
            }) as string;
            if (msg) {
              message = msg;
            }
          }
          return { statusCode, message, result };
        }),
      );
    }
    return next.handle();
  }
}
