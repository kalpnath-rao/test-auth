import { DynamicModule, Module } from '@nestjs/common';
import { RegisterOptions } from './logger';
import { AppLogger } from './logger.service';
import { CONTEXT_CONFIG, OUTPUT_CONFIG } from './logger.constant';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {
  static register(options: RegisterOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        { provide: CONTEXT_CONFIG, useValue: options.context },
        { provide: OUTPUT_CONFIG, useValue: options.output },
      ],
    };
  }
  constructor(private logger: AppLogger) {
    this.logger.bootstrap();
  }
}
