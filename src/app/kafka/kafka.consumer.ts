import { Controller } from '@nestjs/common';
import { Consume, Subscribe } from './kafka.decorator';

@Controller()
@Consume('MyTopic')
export class KafkaConsumer {
  @Subscribe('MyKey')
  async handle(message: object): Promise<void> {
    console.info(message);
    await Promise.resolve();
  }
}
