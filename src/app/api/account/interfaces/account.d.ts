import moment from 'moment';

export interface BlockTime {
  AMOUNT: number;
  UNIT: moment.unitOfTime.DurationConstructor;
}
