import './polyfills';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ValidationError } from 'class-validator';
import { EnvService } from './app/shared/env/env.service';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { AppLogger } from './app/shared/logger';
import { KafkaConfig } from './config/kafka.config';
import { Partitioners } from 'kafkajs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import { resolve } from 'node:path';
import { I18nService } from 'nestjs-i18n';

/**
 * @author
 * @description A class to handle initialization of server
 */
class Server {
  static createKafkaOptions(KAFKA: KafkaConfig): KafkaOptions {
    const clientConfig = {
      clientId: KAFKA.CLIENT_ID,
      brokers: KAFKA.BROKERS,
    };

    if (KAFKA.SASL_USERNAME && KAFKA.SASL_PASSWORD) {
      Object.assign(clientConfig, {
        sasl: {
          mechanism: 'plain',
          username: KAFKA.SASL_USERNAME,
          password: KAFKA.SASL_PASSWORD,
        },
        ssl: {
          rejectUnauthorized: false,
        },
      });
    }

    return {
      transport: Transport.KAFKA,
      options: {
        client: clientConfig,
        consumer: {
          allowAutoTopicCreation: true,
          groupId: KAFKA.GROUP_ID + Math.random(),
        },
        producer: {
          allowAutoTopicCreation: true,
          createPartitioner: Partitioners.LegacyPartitioner,
        },
        run: {
          autoCommit: false,
        },
      },
    };
  }

  static async bootstrap(): Promise<Server> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const env = app.get(EnvService);
    app.connectMicroservice<KafkaOptions>(this.createKafkaOptions(env.KAFKA), {
      inheritAppConfig: true,
    });

    app.connectMicroservice<GrpcOptions>(
      {
        transport: Transport.GRPC,
        options: {
          url: env.GRPC.AUTH_SERVICE,
          package: 'Accelerator.Auth',
          protoPath: resolve(__dirname, './proto/auth.proto'),
        },
      },
      {
        inheritAppConfig: true,
      },
    );
    app.enableShutdownHooks();
    await app.startAllMicroservices();
    const server = new Server(app);
    server.setupSwagger();
    return server;
  }
  readonly #env = this.app.get(EnvService);
  readonly #logger = this.app.get(AppLogger);
  constructor(public app: INestApplication) {
    // app.enableCors();
    app.enableCors({
      allowedHeaders: '*',
      origin: [
        'http://localhost:4200',
        'http://localhost:3000',
        'https://nextweb-dev.appskeeper.in',
      ],
      credentials: true,
    });
    // app.use(helmet());

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ['1', '2'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (args: ValidationError[]) => {
          const reasons: { message: string }[] = [];
          (function handle(prefix: string[], errors: ValidationError[]) {
            errors.forEach((error) => {
              if (error.constraints) {
                reasons.push(
                  ...Object.values(error.constraints).map((message) => {
                    const field = prefix.concat(error.property).join('.');
                    return { field, message };
                  }),
                );
              }
              if (error.children?.length) {
                handle([...prefix, error.property], error.children);
              }
            });
          })([], args);
          return new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              error: 'ValidationError',
              message: reasons[0]?.message,
              reasons,
            },
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    );

    this.setupFilters();
    this.setupInterceptors();
  }
  setupInterceptors() {
    const reflector = this.app.get(Reflector);
    const timeout = new TimeoutInterceptor(reflector);
    this.app.useGlobalInterceptors(timeout);
  }
  setupFilters() {
    const { httpAdapter } = this.app.get(HttpAdapterHost);
    const filter = new HttpExceptionFilter(httpAdapter);
    filter.i18n = this.app.get(I18nService);
    filter.logger = this.#logger;
    this.app.useGlobalFilters(filter);
  }

  setupSwagger() {
    const bearerOptions: SecuritySchemeObject = {
      scheme: 'bearer',
      bearerFormat: 'JWT',
      type: 'http',
    };

    const builder = new DocumentBuilder()
      .setTitle('Auth Service')
      .setDescription('Accelerator')
      .setVersion('1.0')
      .addBasicAuth()
      .addBearerAuth(bearerOptions, 'AuthToken')
      .addBearerAuth(bearerOptions, 'RefreshToken')
      .addBearerAuth(bearerOptions, 'PasswordToken')
      .addBearerAuth(bearerOptions, 'MFAToken')
      .build();
    const document = SwaggerModule.createDocument(this.app, builder);
    SwaggerModule.setup('api', this.app, document, {
      customSiteTitle: 'Docs | My Application',
    });
  }

  async start() {
    try {
      const port = this.#env.PORT;
      await this.app.listen(port);
      this.#logger.log(`App is running on: ${await this.app.getUrl()}`);
    } catch (err) {
      this.#logger.error(err.message, err.stack);
    }
  }
}

Server.bootstrap()
  .then(async (server) => {
    await server.start();
  })
  .catch((err) => {
    //Handle application errors with friendly messages
    return err;
  });
