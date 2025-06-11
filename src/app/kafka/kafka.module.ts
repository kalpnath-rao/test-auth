import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

// import { EnvModule, EnvService } from '@shared/env';
import { AppLogger, LoggerModule } from '@shared/logger';
import { KafkaConsumer } from './kafka.consumer';
import { Partitioners } from 'kafkajs';
import { ProducerService } from './producer.service';
import {
  KAFKA_ADMIN,
  KAFKA_CLIENT,
  KAFKA_CONFIG,
  KAFKA_CONSUMER,
  KAFKA_PRODUCER,
} from './kafka.constants';
import { IAsyncRegisterOptions, IRegisterOptions } from './kafka.types';
import { Kafka, Admin, Consumer, Producer } from 'kafkajs';
import { KafkaMap } from './kafka.map';

@Module({
  imports: [
    LoggerModule.register({
      context: KafkaModule.name,
    }),
  ],
  controllers: [KafkaConsumer],
  providers: [
    ProducerService,
    {
      provide: KAFKA_CLIENT,
      inject: [KAFKA_CONFIG],
      useFactory(config: IRegisterOptions): Kafka {
        console.log('Here logging kafka credentials', config);
        const kafkaConfig = {
          brokers: config.brokers,
          clientId: config.clientId,
        };

        if (config.sasl?.username && config.sasl?.password) {
          Object.assign(kafkaConfig, {
            sasl: {
              mechanism: 'plain' as const,
              username: config.sasl.username,
              password: config.sasl.password,
            },
            ssl: {
              rejectUnauthorized: false,
            },
          });
        }

        return new Kafka(kafkaConfig);
      },
    },
    {
      provide: KAFKA_PRODUCER,
      inject: [KAFKA_CLIENT],
      async useFactory(client: Kafka): Promise<Producer> {
        const producer = client.producer({
          createPartitioner: Partitioners.DefaultPartitioner,
          allowAutoTopicCreation: true,
        });
        return producer;
      },
    },
    {
      provide: KAFKA_CONSUMER,
      inject: [KAFKA_CLIENT, KAFKA_CONFIG],
      async useFactory(
        client: Kafka,
        config: IRegisterOptions,
      ): Promise<Consumer> {
        const consumer = client.consumer({
          allowAutoTopicCreation: true,
          groupId: config.groupId,
        });
        return consumer;
      },
    },
    {
      provide: KAFKA_ADMIN,
      inject: [KAFKA_CLIENT],
      async useFactory(client: Kafka): Promise<Admin> {
        const admin = client.admin({});
        return admin;
      },
    },
  ],
  exports: [
    ProducerService,
    KAFKA_CLIENT,
    KAFKA_PRODUCER,
    KAFKA_CONSUMER,
    KAFKA_ADMIN,
  ],
})
@Global()
export class KafkaModule implements OnModuleInit, OnApplicationShutdown {
  static register(config: IRegisterOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: KAFKA_CONFIG,
          useValue: config,
        },
      ],
      exports: [KAFKA_CONFIG],
    };
  }
  static registerAsync(config: IAsyncRegisterOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: config.imports ?? [],
      providers: [
        {
          provide: KAFKA_CONFIG,
          inject: config.inject ?? [],
          useFactory: config.useFactory,
        },
      ],
      exports: [KAFKA_CONFIG],
    };
  }
  constructor(
    @Inject(KAFKA_PRODUCER) public producer: Producer,
    @Inject(KAFKA_CONSUMER) public consumer: Consumer,
    @Inject(KAFKA_ADMIN) public admin: Admin,
    private logger: AppLogger,
  ) {}
  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.producer.connect(),
      this.consumer.connect(),
      this.admin.connect(),
    ]);
    await this.consumer.subscribe({
      fromBeginning: true,
      topics: KafkaMap.topics(),
    });
    await this.consumer.run({
      autoCommit: true,
      eachMessage: KafkaMap.eachMessage(this.logger),
    });
  }
  async onApplicationShutdown(): Promise<void> {
    await Promise.all([this.consumer.disconnect(), this.producer.disconnect()]);
  }
}
