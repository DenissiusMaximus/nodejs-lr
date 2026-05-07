import { CategoryEntity, CreateCategoryInput, UpdateCategoryInput } from "../../schemas/category.schema";

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ICategoryRepository {
    findMany(filters?: any, options?: PaginationOptions): Promise<PaginatedResult<CategoryEntity>>;
    findById(id: string): Promise<CategoryEntity | null>;
    create(data: CreateCategoryInput): Promise<CategoryEntity>;
    updateById(id: string, data: UpdateCategoryInput): Promise<CategoryEntity | null>;
    deleteById(id: string): Promise<boolean>;
}