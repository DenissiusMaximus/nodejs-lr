import { ICategoryRepository, PaginatedResult, PaginationOptions } from './ICategoryRepository';
import { CategoryEntity, CreateCategoryWithOwnerInput, UpdateCategoryInput } from '../../schemas/category.schema';
import { CategoryModel } from '../../models/category.model';

export class MongoCategoryRepository implements ICategoryRepository {
    
    async findMany(
        filters?: { ownerId?: string; type?: string },
        options?: PaginationOptions
    ): Promise<PaginatedResult<CategoryEntity>> {
        
        const query: any = {};
        if (filters?.ownerId !== undefined) query.ownerId = filters.ownerId;
        if (filters?.type !== undefined) query.type = filters.type;

        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;

        let sortObj: any = { createdAt: -1 }; 
        if (options?.sort) {
            const isDescending = options.sort.startsWith('-');
            const sortField = isDescending ? options.sort.substring(1) : options.sort;
            sortObj = { [sortField]: isDescending ? -1 : 1 };
        }

        const [categories, total] = await Promise.all([
            CategoryModel.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit),
            CategoryModel.countDocuments(query)
        ]);

        return {
            data: categories as unknown as CategoryEntity[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string): Promise<CategoryEntity | null> {
        const category = await CategoryModel.findById(id);
        return category as unknown as CategoryEntity | null;
    }

    async create(data: CreateCategoryWithOwnerInput): Promise<CategoryEntity> {
        const newCategory = await CategoryModel.create(data);
        return newCategory as unknown as CategoryEntity;
    }

    async updateById(id: string, data: UpdateCategoryInput): Promise<CategoryEntity | null> {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            data,
            { runValidators: true, returnDocument: 'after' }
        );
        return updatedCategory as unknown as CategoryEntity | null;
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return result !== null;
    }
}