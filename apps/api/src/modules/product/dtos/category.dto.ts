import { Length } from "class-validator";

export class CategoryDto {
    @Length(2,100)
    name: string;
}