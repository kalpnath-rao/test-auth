import { ApiException } from '@api/api.exception';
import { AppLogger } from '@app/shared/logger';
import type { ArgumentsHost } from '@nestjs/common';
import {
  Catch,
  ContextType,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { GqlArgumentsHost } from '@nestjs/graphql';

type TranslatableErrorResponse = {
  statusCode?: number;
  message: string;
  reasons?: Array<{ message: string }>;
};

@Catch()
export class HttpExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  i18n!: I18nService;
  logger!: AppLogger;

  catch(exception: unknown, host: ArgumentsHost): void | HttpException {
    const contextType = host.getType() as ContextType | 'graphql';
    let i18nLang = 'en';

    try {
      if (contextType === 'http' || contextType === 'graphql') {
        try {
          const gqlContext = GqlArgumentsHost.create(host).getContext();
          i18nLang = gqlContext?.req?.i18nLang || 'en';
        } catch {
          const httpRequest = host.switchToHttp().getRequest();
          i18nLang = httpRequest?.i18nLang || 'en';
        }
      }
    } catch (langError: unknown) {
      this.logger?.warn?.(
        `Could not determine i18nLang: ${(langError as Error).message}`,
        (langError as Error).stack,
      );
    }

    // Translate ApiException
    if (exception instanceof ApiException) {
      const resp = exception.getResponse() as TranslatableErrorResponse;
      if (typeof resp === 'object' && resp !== null) {
        resp.message = this.i18n.translate(resp.message, { lang: i18nLang });

        if (exception.data) {
          for (const [key, value] of Object.entries(exception.data)) {
            resp.message = resp.message?.replace(`{{${key}}}`, String(value));
          }
        }

        if (Array.isArray(resp.reasons)) {
          resp.reasons.forEach((reason) => {
            reason.message = this.i18n.translate(reason.message, {
              lang: i18nLang,
            });
            if (exception['data']) {
              for (const [key, value] of Object.entries(exception['data'])) {
                reason.message = reason.message?.replace(
                  `{{${key}}}`,
                  String(value),
                );
              }
            }
          });
        }
      }
    }

    // GraphQL Exception
    let isGraphQL = false;
    if (contextType === 'graphql') {
      try {
        GqlArgumentsHost.create(host).getContext();
        isGraphQL = true;
      } catch {
        isGraphQL = false;
      }
    }

    if (isGraphQL) {
      this.logger?.debug?.('Handling GraphQL exception');
      const gqlHost = GqlArgumentsHost.create(host);
      const context = gqlHost.getContext<{ req?: Request }>();
      const req = context?.req;
      const correlationId = req['correlationId'] || '';
      const contextName = `${HttpExceptionFilter.name}-GraphQL-${correlationId}`;

      let response: TranslatableErrorResponse = {
        message: 'Internal server error',
      };
      let status = HttpStatus.INTERNAL_SERVER_ERROR;

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        response = exception.getResponse() as TranslatableErrorResponse;
      } else {
        this.logger?.error?.(
          `Non-HttpException in GraphQL context: ${(exception as Error)?.message || exception}`,
          (exception as Error)?.stack,
          contextName,
        );
        exception = new HttpException(response, status);
      }

      this.logger?.error?.(
        `GraphQL Error: ${(exception as Error).message}`,
        (exception as Error).stack,
        contextName,
      );

      this.logger?.error?.(
        `GraphQL Error Details: ${JSON.stringify({
          response,
          reqHeaders: req?.headers,
        })}`,
        '',
        contextName,
      );

      return exception as HttpException;
    }

    if (contextType === 'http') {
      this.logger?.debug?.('Handling standard HTTP exception');
      const httpHost = host.switchToHttp();
      const req = httpHost.getRequest<Request>();
      const res = httpHost.getResponse<Response>();
      const correlationId = req['correlationId'] || '';
      const contextName = `${HttpExceptionFilter.name}-HTTP-${correlationId}`;

      let response: TranslatableErrorResponse = {
        message: 'Internal server error',
      };
      let status = HttpStatus.INTERNAL_SERVER_ERROR;

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        response = exception.getResponse() as TranslatableErrorResponse;
      } else {
        this.logger?.error?.(
          `Non-HttpException in HTTP context: ${(exception as Error)?.message || exception}`,
          (exception as Error)?.stack,
          contextName,
        );
      }

      if (typeof response === 'string') {
        response = { statusCode: status, message: response };
      } else if (typeof response === 'object' && response !== null) {
        response.statusCode = response.statusCode || status;
      } else {
        response = {
          statusCode: status,
          message: 'An unexpected error occurred',
        };
      }

      this.logger?.error?.(
        `HTTP Error ${status}: ${(exception as Error)?.message}`,
        (exception as Error)?.stack,
        contextName,
      );

      this.logger?.error?.(
        `HTTP Error Details: ${JSON.stringify({
          response,
          reqHeaders: req?.headers,
          reqUrl: req?.url,
        })}`,
        '',
        contextName,
      );

      if (!res.headersSent) {
        res.status(status).json(response);
      } else {
        this.logger?.warn?.(
          `Headers already sent for HTTP request ${req.url}, cannot send error response.`,
          contextName,
        );
      }
    } else {
      this.logger?.warn?.(
        `Unhandled context type "${contextType}". Falling back to base filter.`,
        (exception as Error)?.stack,
      );
      super.catch(exception as Error, host);
    }
  }
}
