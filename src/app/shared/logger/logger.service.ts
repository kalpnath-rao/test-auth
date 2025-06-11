import {
  ConsoleLogger,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CONTEXT_CONFIG, OUTPUT_CONFIG } from './logger.constant';
import { logger } from './logger.winston';
import {
  createLogger,
  format,
  transports,
  config as wConfig,
  Logger,
} from 'winston';
import { Request, Response } from 'express';
import { resolve } from 'node:path';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppLogger extends ConsoleLogger {
  context!: string;
  logger!: Logger;
  constructor(
    @Inject(CONTEXT_CONFIG) context: string,
    @Inject(OUTPUT_CONFIG) public output: string,
    private cls: ClsService,
  ) {
    super(context);
  }
  createMetadata(
    context: string = this.context,
  ): Record<string, string | number | object | []> {
    const metadata: Record<string, string | number | object | []> = {
      context,
      timestamp: this.getTimestamp(),
      process: `P${process.pid}`,
      correlationId: this.correlationId,
    };
    if (this.output) {
      metadata.filename = this.output;
    }
    return metadata;
  }

  private contextWithCorrelation(context: string): string {
    if (!this.correlationId) return context;
    return context ? `${context}-${this.correlationId}` : context;
  }

  get correlationId(): string {
    const cid = this.cls.get('CORRELATION_ID');
    return cid || '';
  }

  setCorrelationId(id: string): void {
    this.cls.enterWith({ [Symbol('CORRELATION_ID')]: id });
    this.cls.set('CORRELATION_ID', id);
  }

  async bootstrap(): Promise<void> {
    const formatters = [
      format.label({ label: 'Info Combined' }),
      format.timestamp({
        format: 'DD-MM-YYYY, HH:MM:SS',
      }),
    ];
    if (process.env['NEW_RELIC.APP_NAME'] && process.env['NEW_RELIC.LICENSE']) {
      const newrelic = await import('./newrelic.index');
      formatters.push(newrelic.formatter());
    }
    this.logger = createLogger({
      levels: wConfig.syslog.levels,
      defaultMeta: { context: 'default' },
      transports: [
        new transports.File({
          level: 'debug',
          filename: 'combined.log',
          dirname: resolve(__dirname, '../../../../logs'),
          format: format.combine(...formatters),
        }),
      ],
    });
  }
  log(message: string, context: string = this.context): void {
    super.log(message, this.contextWithCorrelation(context));
    logger.info(message, this.createMetadata(context));
  }
  error(message: string, stack: string, context: string = this.context): void {
    super.error(message, stack, this.contextWithCorrelation(context));
    const meta = this.createMetadata(context);
    meta.stack = stack;
    logger.error(message, meta);
  }
  warn(message: string, context: string = this.context): void {
    super.warn(message, this.contextWithCorrelation(context));
    logger.warn(message, this.createMetadata(context));
  }
  debug(message: string, context: string = this.context): void {
    super.debug(message, this.contextWithCorrelation(context));
    logger.debug(message, this.createMetadata(context));
  }
  json(data: object | object[], context: string = this.context): void {
    super.debug(data);
    logger.debug('', this.createMetadata(context));
  }
  request(req: Request, res: Response, cid = ''): void {
    const start = Date.now();
    res.on('finish', () => {
      const meta = this.createMetadata();
      if (req['ctx']) {
        const ctx = req['ctx'] as ExecutionContext;
        meta.context = ctx.getClass().name;
        meta.handler = ctx.getHandler().name;
      }
      meta.status = res.statusCode;
      const color =
        meta.status >= 500
          ? 31 // red
          : meta.status >= 400
            ? 33 // yellow
            : meta.status >= 300
              ? 36 // cyan
              : meta.status >= 200
                ? 32 // green
                : 0; // no color
      meta.method = req.method;
      meta.url = req.url;
      meta.resTime = Date.now() - start;
      if (meta.status > 400) {
        meta.request = {
          body: req.body,
          query: req.query,
          params: req.params,
          headers: req.headers,
        };
        meta.response = {};
      }
      if (meta.status.toString().startsWith('20')) {
        logger.info(
          JSON.stringify({
            reqHeaders: req.headers,
            body: req.body,
            query: req.query,
          }),
          meta,
        );

        super.log(
          JSON.stringify({
            reqHeaders: req.headers,
            body: req.body,
            query: req.query,
          }),
          `${meta.context}${cid ? `-${cid}` : ''}`,
        );
      }
      super.log(
        `${meta.method} ${meta.url} \x1b[${color}m${
          meta.status
        }\x1b[0m${this.formatTimestampDiff(meta.resTime)}`,
        `${meta.context}${cid ? `-${cid}` : ''}`,
      );

      logger.info(
        `${meta.method} ${meta.url} ${meta.status} +${meta.resTime}ms`,
        meta,
      );
    });
  }
  catch(context: ExecutionContext, err: HttpException): void {
    const meta = this.createMetadata(context.getClass().name);
    meta.handler = context.getHandler().name;
    meta.stack = err.stack ?? '';
    logger.error(err.message, meta);
  }
}
