import { ICategoryRepository, PaginatedResult, PaginationOptions } from '../rerpositories/ICategoryRepository'; 
import { CategoryEntity, CreateCategoryInput, UpdateCategoryInput } from '../../schemas/category.schema';

export class CategoryService {
    constructor(private repository: ICategoryRepository) {}

    async create(data: CreateCategoryInput, ownerId: string): Promise<CategoryEntity> {
        return this.repository.create({ ...data, ownerId });
    }

    async update(id: string, data: UpdateCategoryInput): Promise<CategoryEntity | null> {
        return this.repository.updateById(id, data);
    }

    async getAll(
        filters?: { ownerId?: string; type?: string },
        options?: PaginationOptions
    ): Promise<PaginatedResult<CategoryEntity>> {
        return this.repository.findMany(filters, options);
    }

    async getById(id: string): Promise<CategoryEntity | null> {
        return this.repository.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.deleteById(id);
    }
}