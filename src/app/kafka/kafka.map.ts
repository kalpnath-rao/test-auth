import { EachMessagePayload } from 'kafkajs';
import { KAFKA_MAPPING } from './kafka.constants';
import { AppLogger } from '@app/shared/logger';
import { v4 as uuid } from 'uuid';

export class KafkaMap {
  static topics(): string[] {
    const mapping = Reflect.getMetadata(KAFKA_MAPPING, this);
    if (mapping) {
      return Object.keys(mapping);
    }
    return [];
  }
  static eachMessage(logger: AppLogger) {
    const TOPICS = Reflect.getMetadata(KAFKA_MAPPING, KafkaMap);
    return async ({ topic, message }: EachMessagePayload): Promise<void> => {
      try {
        const handlers = TOPICS[topic] as Record<
          string,
          (msg: object, key: string, topic: string) => Promise<void>
        >;
        if (handlers) {
          const t1 = Date.now();
          const key = message.key?.toString() ?? '';
          const value = message.value?.toString() ?? '';
          const handler = handlers[key];
          let messageValueString = '';
          if (handler) {
            try {
              const parsedValue = JSON.parse(value);
              const correlationId = parsedValue.correlationId || uuid();
              logger.setCorrelationId(correlationId);
              delete parsedValue.correlationId;
              messageValueString = JSON.stringify(parsedValue);
              await handler(parsedValue, key, topic);
              logger.log(
                `Topic : ${topic}, key: ${key}, message: ${messageValueString} +${
                  Date.now() - t1
                }ms`,
              );
            } catch (err) {
              logger.error(err.message, err.stack);
              logger.error(
                `Topic ${topic}, key: ${key}, message: ${messageValueString} +${
                  Date.now() - t1
                }ms`,
                '',
              );
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  }
}
