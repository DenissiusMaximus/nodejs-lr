import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(1, "Назва не може бути порожньою").max(100, "Назва занадто довга"),
    
    description: z.string().max(500, "Опис занадто довгий").optional(),
    
    type: z.enum(['income', 'expense']),
    
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Невірний формат кольору, очікується HEX (наприклад, #FF0000)"),
    
    userId: z.number().int().positive("ID користувача має бути додатним числом")
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CategoryEntity = CreateCategoryInput & {
    id: string; 
    createdAt: Date;
    updatedAt: Date;
};