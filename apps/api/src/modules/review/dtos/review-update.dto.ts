import { IsInt, IsOptional, Max, Min } from "class-validator";
import { PartialType } from '@nestjs/swagger';
import { ReviewDto } from "./review.dto";

export class ReviewUpdateDto extends PartialType(ReviewDto) {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    stars: number;

    @IsOptional()
    description: string;
}