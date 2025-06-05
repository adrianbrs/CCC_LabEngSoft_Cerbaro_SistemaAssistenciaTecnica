import { IsOptional, MaxLength } from 'class-validator';

export class CategoryFiltersDto{
    @IsOptional()
    @MaxLength(100)
    name?: string;
}