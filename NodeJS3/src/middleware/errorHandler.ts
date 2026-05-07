import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        res.status(400).json({
            status: 'error',
            message: 'Помилка валідації даних запиту',
            issues: err.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    if (err instanceof mongoose.Error.CastError && err.path === '_id') {
        res.status(400).json({
            status: 'error',
            message: 'Невалідний формат ідентифікатора (ID)'
        });
        return;
    }

    if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({
            status: 'error',
            message: `Невалідний тип даних для поля: ${err.path}`
        });
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const issues = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        
        res.status(400).json({
            status: 'error',
            message: 'Помилка збереження даних в БД (Валідація Mongoose)',
            issues
        });
        return;
    }

    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        res.status(409).json({
            status: 'error',
            message: 'Запис з такими унікальними значеннями вже існує'
        });
        return;
    }

    console.error('[Unhandled Error]:', err);
    res.status(500).json({
        status: 'error',
        message: 'Внутрішня помилка сервера'
    });
};