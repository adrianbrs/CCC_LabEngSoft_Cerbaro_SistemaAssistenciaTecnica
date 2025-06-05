import { Injectable, Logger } from "@nestjs/common";
import { CategoryDto } from "./dtos/category.dto";
import { Category } from "./models/category.entity";
import { CategoryUpdateDto } from "./dtos/category-update.dto";
import { CategoryFiltersDto } from "./dtos/category-filters.dto";
import { ILike } from "typeorm";

@Injectable()
export class CategoryService{
    private readonly logger = new Logger(CategoryService.name);

    constructor(){
        this.logger.log('CategoryService initialized');
    }

    async getAll(filters?: CategoryFiltersDto): Promise<CategoryDto[]>{
        this.logger.log(`Fetching all categories`, filters);
        const categories = await Category.find({
            where: {
                ...(filters?.name && {
                    name: ILike(`%${filters.name}%`)
                }),
            },
        });
        return categories;
    }

    async getCategoryById(categoryId: Category['id']): Promise<CategoryDto> {
        this.logger.log(`Fetching category with ID: ${categoryId}`);
        
        const category = await Category.findOneOrFail({
            where: {
                id: categoryId
            }
        });
        this.logger.log(`Category found: ${JSON.stringify(category)}`);
        return category;
    }
    

    async create(categoryDto: CategoryDto): Promise<CategoryDto>{

        const category = Category.create({
            ...categoryDto
        })

        await Category.save(category);

        return category;
    }

    async update(categoryId: Category['id'], updates: CategoryUpdateDto) : Promise<CategoryDto>{
         this.logger.log(`Updating category ${categoryId}`);

         const category = await Category.findOneOrFail({
            where: {
                id: categoryId
            }
        });

        Category.merge(category, {...updates});

        return category.save();
    }

    async delete(categoryId: Category['id']): Promise<void> {
        this.logger.log(`Deleting category with ID: ${categoryId}`);

        const category = await Category.findOneOrFail({
            where: {
                id: categoryId
            }
        });
        await category.remove();
        this.logger.log(`Category with ID: ${categoryId} deleted`); 
    }

}
