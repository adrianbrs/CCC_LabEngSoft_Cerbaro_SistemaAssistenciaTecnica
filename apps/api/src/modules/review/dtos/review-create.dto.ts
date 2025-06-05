import { IsInt, IsOptional, Length, Max, Min } from "class-validator";

export class ReviewCreateDto {
    @IsInt()
    @Min(1)
    @Max(5)
    stars: number;
    
    @IsOptional()
    @Length(0, 255)
    description: string;
}