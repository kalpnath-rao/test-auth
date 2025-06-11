import { Global, Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from '@config/index';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { logger } from 'nestjs-i18n';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate(config: Record<string, unknown>) {
        console.log('config', config);
        Object.keys(config).forEach((key: string) => {
          const [root, nested] = key.split('.');

          if (nested) {
            if (!config[root]) {
              config[root] = {};
            }
            const target = config[root] as Record<string, unknown>;
            const rawValue = (config[key] as string)?.trim();

            // Only try parsing if it looks like valid JSON
            const shouldParse =
              (rawValue.startsWith('{') && rawValue.endsWith('}')) ||
              (rawValue.startsWith('[') && rawValue.endsWith(']')) ||
              ['true', 'false', 'null'].includes(rawValue);

            try {
              target[nested] = shouldParse ? JSON.parse(rawValue) : rawValue;
            } catch (err) {
              target[nested] = rawValue;
              logger.error(err, `Error parsing nested env var: ${key}`);
            }
          } else {
            // Top-level keys
            const rawValue = (config[key] as string)?.trim();
            config[key] = rawValue;
          }
        });
        const validatedConfig = plainToInstance(EnvConfig, config, {
          enableImplicitConversion: true,
        });
        console.log('validatedConfig', validatedConfig);
        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });

        if (errors.length > 0) {
          throw new Error(errors.toString());
        }

        return validatedConfig;
      },
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
