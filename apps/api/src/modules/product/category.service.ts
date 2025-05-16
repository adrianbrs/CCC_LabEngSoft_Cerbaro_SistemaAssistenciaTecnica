import { Injectable, Logger } from "@nestjs/common";
import { CategoryDto } from "./dtos/category.dto";
import { Category } from "./models/category.entity";
import { CategoryUpdateDto } from "./dtos/category-update.dto";

@Injectable()
export class CategoryService{
    private readonly logger = new Logger(CategoryService.name);

    constructor(){
        this.logger.log('CategoryService initialized');
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

}
