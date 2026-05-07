// import { ICategoryRepository } from './ICategoryRepository';
// import { CategoryEntity } from '../../schemas/category.schema';
// import { id } from 'zod/v4/locales';

// export class InMemoryCategoryRepository implements ICategoryRepository {
//     private storage = new Map<string, CategoryEntity>();

//     findMany(filters?: { userId?: number; type?: string }): CategoryEntity[] {
//         let results = Array.from(this.storage.values());

//         if (filters) {
//             if (filters.userId !== undefined) {
//                 results = results.filter(category => category.userId === filters.userId);
//             }

//             if (filters.type !== undefined) {
//                 results = results.filter(category => category.type === filters.type);
//             }
//         }

//         return results;
//     }

//     findById(id: string): CategoryEntity | undefined {
//         return this.storage.get(id);
//     }

//     save(entity: CategoryEntity): void {
//         this.storage.set(entity.id, entity);
//     }

//     deleteById(id: string): boolean {
//         return this.storage.delete(id);
//     }

//     reset(): void {
//         this.storage.clear();
//     }
// }