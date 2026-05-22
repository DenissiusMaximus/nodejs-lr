import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import { CategoryModel } from '../models/category.model';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Category Model Unit Tests', () => {
    const validData = {
        name: 'Транспорт',
        type: 'expense',
        color: '#0000FF',
        ownerId: new mongoose.Types.ObjectId()
    };

    it('повинен успішно створити категорію та згенерувати автоматичні дати', async () => {
        const category = new CategoryModel(validData);
        const savedCategory = await category.save();

        expect(savedCategory._id).toBeDefined();
        expect(savedCategory.name).toBe(validData.name);
        expect(savedCategory.createdAt).toBeDefined();
        expect(savedCategory.updatedAt).toBeDefined();
    });

    it('повинен повернути ValidationError, якщо відсутні обов\'язкові поля', async () => {
        const category = new CategoryModel({ type: 'expense' });

        let err: any;
        try { await category.save(); } catch (error) { err = error; }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.name).toBeDefined();
        expect(err.errors.color).toBeDefined();
        expect(err.errors.ownerId).toBeDefined();
    });

    it('повинен повернути помилку валідації через regex для поля color', async () => {
        const category = new CategoryModel({ ...validData, color: 'blue' });

        let err: any;
        try { await category.save(); } catch (error) { err = error; }

        expect(err.errors.color).toBeDefined();
    });

    it('повинен коректно обчислювати віртуальну властивість displayInfo', () => {
        const category = new CategoryModel(validData);
        expect(category.displayInfo).toBe('Транспорт (Витрата) [Колір: #0000FF]');
    });
});