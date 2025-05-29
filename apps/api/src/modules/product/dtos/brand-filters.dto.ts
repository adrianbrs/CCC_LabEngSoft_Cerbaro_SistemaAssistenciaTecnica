import { IsOptional, MaxLength } from 'class-validator';

export class BrandFiltersDto {
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
