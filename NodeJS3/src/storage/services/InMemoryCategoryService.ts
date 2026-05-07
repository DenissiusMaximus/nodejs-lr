// import crypto from 'crypto';
// import { ICategoryRepository } from '../rerpositories/ICategoryRepository'; 
// import { CategoryEntity, CreateCategoryInput, UpdateCategoryInput } from '../../schemas/category.schema';

// export class CategoryService {
//     constructor(private repository: ICategoryRepository) {}

//     create(data: CreateCategoryInput): CategoryEntity {
//         const now = new Date();
//         const newCategory: CategoryEntity = {
//             ...data,
//             id: crypto.randomUUID(),
//             createdAt: now,
//             updatedAt: now
//         };
        
//         this.repository.save(newCategory); 
//         return newCategory;
//     }

//     update(id: string, data: UpdateCategoryInput): CategoryEntity | null {
//         const existing = this.repository.findById(id);
        
//         if (!existing) return null; 

//         const updated: CategoryEntity = {
//             ...existing,
//             ...data,
//             updatedAt: new Date()
//         };

//         this.repository.save(updated); 
//         return updated;
//     }
    

//     getAll(filters?: { userId?: number; type?: string }): CategoryEntity[] {
//         return this.repository.findMany(filters);
//     }

//     getById(id: string): CategoryEntity | undefined {
//         return this.repository.findById(id);
//     }

//     delete(id: string): boolean {
//         const existing = this.repository.findById(id);
//         if (!existing) return false;

//         return this.repository.deleteById(id);
//     }
// }