import { KAFKA_MAPPING, KAFKA_TOPIC } from './kafka.constants';
import { KafkaMap } from './kafka.map';
export * from './kafka.constants';

export function Consume(topic: string) {
  return function <T extends { new (...args): object }>(Cls: T): T {
    const KEYS = Reflect.getMetadata(KAFKA_TOPIC, Cls) ?? {};
    return class extends Cls {
      constructor(...args) {
        super(...args);
        const MAPPING = Reflect.getMetadata(KAFKA_MAPPING, KafkaMap) ?? {};
        Object.entries(KEYS).forEach(([key, handler]: [string, () => void]) => {
          if (!MAPPING[topic]) {
            MAPPING[topic] = {};
          }
          MAPPING[topic][key] = handler.bind(this);
        });
        Reflect.defineMetadata(KAFKA_MAPPING, MAPPING, KafkaMap);
      }
    };
  };
}

export function Subscribe(key?: string) {
  return (
    t: object,
    property: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (!key) {
      key = property;
    }
    const HANDLERS = Reflect.getMetadata(KAFKA_TOPIC, t.constructor) ?? {};
    HANDLERS[key] = descriptor.value;
    Reflect.defineMetadata(KAFKA_TOPIC, HANDLERS, t.constructor);
    return descriptor;
  };
}
