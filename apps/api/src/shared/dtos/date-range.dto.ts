import { IDateRangeFilter } from '@musat/core';
import { IsDate, ValidateIf } from 'class-validator';
import {
  Between,
  Equal,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

export class DateRangeDto implements IDateRangeFilter {
  @IsDate()
  @ValidateIf((o: DateRangeDto) => Boolean((!o.at && !o.to) || o.from))
  from?: Date;

  @IsDate()
  @ValidateIf((o: DateRangeDto) => Boolean((!o.at && !o.from) || o.to))
  to?: Date;

  @IsDate()
  @ValidateIf((o: DateRangeDto) => Boolean(!o.from && !o.to))
  at?: Date;
}

export function DateRange(dto: DateRangeDto): FindOperator<Date> {
  if (dto.from && dto.to) {
    return Between(dto.from, dto.to);
  }
  if (dto.from) {
    return MoreThanOrEqual(dto.from);
  }
  if (dto.to) {
    return LessThanOrEqual(dto.to);
  }
  if (dto.at) {
    return Equal(dto.at);
  }
  throw new TypeError('No date range specified');
}
