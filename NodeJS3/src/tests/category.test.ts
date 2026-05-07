import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Category API Integration Tests (MongoDB)', () => {
    const validCategory = {
        name: 'Продукти',
        description: 'Витрати на супермаркет',
        type: 'expense',
        color: '#FF0000',
        userId: 1
    };

    it('повинен створити категорію та повернути статус 201', async () => {
        const res = await request(app)
            .post('/categories')
            .send(validCategory)
            .expect(201);

        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(validCategory.name);
        expect(res.body.createdAt).toBeDefined();
    });

    it('повинен повернути 400 при невалідних даних (Zod)', async () => {
        const invalidData = { name: '', type: 'wrong_type' };
        const res = await request(app)
            .post('/categories')
            .send(invalidData)
            .expect(400);

        expect(res.body.status).toBe('error');
        expect(res.body.issues).toBeDefined();
    });

    it('повинен повернути список категорій з пагінацією зі статусом 200', async () => {
        await request(app).post('/categories').send(validCategory);

        const res = await request(app)
            .get('/categories')
            .expect(200);

        // Перевіряємо новий формат відповіді з пагінацією
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.pagination.total).toBe(1);
    });

    it('повинен повернути запис за ID зі статусом 200', async () => {
        const createRes = await request(app).post('/categories').send(validCategory);
        const categoryId = createRes.body.id;

        const getRes = await request(app)
            .get(`/categories/${categoryId}`)
            .expect(200);

        expect(getRes.body.id).toBe(categoryId);
    });

    // СПЕЦИФІЧНИЙ КЕЙС MONGODB 1: Невалідний формат ID (CastError)
    it('повинен повернути 400, якщо передано невалідний формат ObjectId', async () => {
        await request(app)
            .get('/categories/some-invalid-id-format')
            .expect(400);
    });

    // СПЕЦИФІЧНИЙ КЕЙС MONGODB 2: Валідний формат ID, але запис не знайдено
    it('повинен повернути 404, якщо запис не знайдено (валідний ObjectId)', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString(); // Генеруємо реальний, але неіснуючий ObjectId
        await request(app)
            .get(`/categories/${fakeId}`)
            .expect(404);
    });

    it('повинен частково оновити запис зі статусом 200', async () => {
        const createRes = await request(app).post('/categories').send(validCategory);
        const categoryId = createRes.body.id;

        const updateRes = await request(app)
            .patch(`/categories/${categoryId}`)
            .send({ name: 'Нова назва', color: '#00FF00' })
            .expect(200);

        expect(updateRes.body.name).toBe('Нова назва');
        expect(updateRes.body.color).toBe('#00FF00');
    });

    it('повинен видалити запис та повернути 204 No Content', async () => {
        const createRes = await request(app).post('/categories').send(validCategory);
        const categoryId = createRes.body.id;

        await request(app).delete(`/categories/${categoryId}`).expect(204);
        await request(app).get(`/categories/${categoryId}`).expect(404);
    });

    it('повинен коректно фільтрувати записи за type', async () => {
        await request(app).post('/categories').send(validCategory);
        await request(app).post('/categories').send({ ...validCategory, type: 'income', name: 'Зарплата' });

        const res = await request(app).get('/categories?type=income').expect(200);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].type).toBe('income');
    });

    it('повинен коректно сортувати записи (sort=-name)', async () => {
        await request(app).post('/categories').send({ ...validCategory, name: 'Апельсини' });
        await request(app).post('/categories').send({ ...validCategory, name: 'Яблука' });

        const res = await request(app).get('/categories?sort=-name').expect(200);

        expect(res.body.data[0].name).toBe('Яблука');
        expect(res.body.data[1].name).toBe('Апельсини');
    });

    it('повинен повертати дані зі специфічного маршруту /expenses', async () => {
        await request(app).post('/categories').send({ ...validCategory, type: 'expense' }); 
        await request(app).post('/categories').send({ ...validCategory, type: 'income' }); 
        
        const res = await request(app).get('/categories/expenses').expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(1); 
        expect(res.body.data[0].type).toBe('expense'); 
    });

    it('повинен коректно фільтрувати записи за userId', async () => {
        await request(app).post('/categories').send({ ...validCategory, userId: 1 });
        await request(app).post('/categories').send({ ...validCategory, userId: 2, name: 'Інша категорія' });

        const res = await request(app).get('/categories?userId=1').expect(200);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].userId).toBe(1);
    });

    it('повинен комбінувати фільтри за type та userId', async () => {
        await request(app).post('/categories').send({ ...validCategory, type: 'expense', userId: 1 });
        await request(app).post('/categories').send({ ...validCategory, type: 'income', userId: 1 });
        await request(app).post('/categories').send({ ...validCategory, type: 'expense', userId: 2 });

        const res = await request(app).get('/categories?type=expense&userId=1').expect(200);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].type).toBe('expense');
        expect(res.body.data[0].userId).toBe(1);
    });

    it('повинен правильно працювати з пагінацією (page=2, limit=1)', async () => {
        await request(app).post('/categories').send({ ...validCategory, name: 'Категорія 1' });
        await request(app).post('/categories').send({ ...validCategory, name: 'Категорія 2' });
        await request(app).post('/categories').send({ ...validCategory, name: 'Категорія 3' });

        const res = await request(app).get('/categories?page=2&limit=1').expect(200);

        expect(res.body.data.length).toBe(1);
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.limit).toBe(1);
        expect(res.body.pagination.total).toBe(3);
        expect(res.body.pagination.totalPages).toBe(3);
    });

    it('повинен повернути 404 при оновленні неіснуючого запису', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        await request(app)
            .patch(`/categories/${fakeId}`)
            .send({ name: 'Нова назва' })
            .expect(404);
    });

    it('повинен повернути 404 при видаленні неіснуючого запису', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        await request(app)
            .delete(`/categories/${fakeId}`)
            .expect(404);
    });

    it('повинен повернути 400 при оновленні з невалідними даними', async () => {
        const createRes = await request(app).post('/categories').send(validCategory);
        const categoryId = createRes.body.id;

        await request(app)
            .patch(`/categories/${categoryId}`)
            .send({ type: 'invalid_type' })
            .expect(400);
    });

    it('повинен включити віртуальну властивість displayInfo у відповідь', async () => {
        const createRes = await request(app).post('/categories').send(validCategory);
        const categoryId = createRes.body.id;

        const getRes = await request(app).get(`/categories/${categoryId}`).expect(200);

        expect(getRes.body.displayInfo).toBeDefined();
        expect(getRes.body.displayInfo).toContain('Витрата');
    });

    it('повинен правильно сортувати за default (createdAt DESC)', async () => {
        const c1 = await request(app).post('/categories').send({ ...validCategory, name: 'Перша' });
        await new Promise(resolve => setTimeout(resolve, 100));
        const c2 = await request(app).post('/categories').send({ ...validCategory, name: 'Друга' });

        const res = await request(app).get('/categories').expect(200);

        expect(res.body.data[0].id).toBe(c2.body.id);
        expect(res.body.data[1].id).toBe(c1.body.id);
    });
});