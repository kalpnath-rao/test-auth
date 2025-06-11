import { Controller } from '@nestjs/common';
import { Consume, AccountKey, KafkaTopic, Subscribe } from '@kafka/index';
import { logger } from 'nestjs-i18n';

@Controller()
@Consume(KafkaTopic.Account)
export class ApiConsumer {
  @Subscribe(AccountKey.Subadmin)
  async create(): Promise<void> {
    logger.log('Connected to Kafka Consumer !', 'KafkaModule');
  }
}
