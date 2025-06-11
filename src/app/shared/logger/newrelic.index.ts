import 'newrelic';
import { Format } from 'logform';
import * as winston from 'winston';
import newrelicFormatterFn from '@newrelic/winston-enricher';

const newrelicFormatter: (winston: typeof import('winston')) => Format =
  newrelicFormatterFn(winston);

export const formatter: () => Format = () => newrelicFormatter(winston);
