import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import { CategoryService } from '../storage/services/CategoryService';

export const createCategoryRouter = (categoryService: CategoryService) => {
    const router = Router();

    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, type, page, limit, sort } = req.query;
            
            const filters = {
                userId: userId ? Number(userId) : undefined,
                type: type as string | undefined
            };

            const options = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                sort: sort as string | undefined
            };

            const result = await categoryService.getAll(filters, options);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.get('/expenses', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit, sort } = req.query;
            
            const options = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                sort: sort as string | undefined
            };

            const result = await categoryService.getAll({ type: 'expense' }, options);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const category = await categoryService.getById(req.params.id);
            if (!category) {
                res.status(404).json({ error: 'Категорію не знайдено' });
                return;
            }
            res.status(200).json(category);
        } catch (error) { next(error); }
    });

    router.post('/', validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newCategory = await categoryService.create(req.body);
            res.status(201).json(newCategory); 
        } catch (error) { next(error); }
    });

    router.patch('/:id', validate(updateCategorySchema), async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const updatedCategory = await categoryService.update(req.params.id, req.body);
            if (!updatedCategory) {
                res.status(404).json({ error: 'Категорію не знайдено' });
                return;
            }
            res.status(200).json(updatedCategory);
        } catch (error) { next(error); }
    });

    router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
        try {
            const isDeleted = await categoryService.delete(req.params.id);
            if (!isDeleted) {
                res.status(404).json({ error: 'Категорію не знайдено' });
                return;
            }
            res.status(204).send(); 
        } catch (error) { next(error); }
    });

    return router;
};