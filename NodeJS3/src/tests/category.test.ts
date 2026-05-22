import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('Category API Integration Tests', () => {
    const validCategory = {
        name: 'Продукти',
        description: 'Витрати на супермаркет',
        type: 'expense',
        color: '#FF0000'
    };

    const registerAndLogin = async (email: string) => {
        const registerRes = await request(app)
            .post('/auth/register')
            .send({ email, password: 'password123' })
            .expect(201);

        const loginRes = await request(app)
            .post('/auth/login')
            .send({ email, password: 'password123' })
            .expect(200);

        const rawSetCookie = loginRes.headers['set-cookie'];
        const setCookie = Array.isArray(rawSetCookie) ? rawSetCookie : rawSetCookie ? [rawSetCookie] : [];
        const accessCookie = setCookie.find((value) => value.startsWith('access_token='))?.split(';')[0];
        const refreshCookie = setCookie.find((value) => value.startsWith('refresh_token='))?.split(';')[0];

        return {
            userId: registerRes.body.id as string,
            accessCookie,
            refreshCookie
        };
    };

    it('повинен заборонити створення категорії без автентифікації', async () => {
        await request(app)
            .post('/categories')
            .send(validCategory)
            .expect(401);
    });

    it('повинен створити категорію та записати ownerId', async () => {
        const auth = await registerAndLogin('owner1@example.com');

        const res = await request(app)
            .post('/categories')
            .set('Cookie', auth.accessCookie!)
            .send(validCategory)
            .expect(201);

        expect(res.body.id).toBeDefined();
        expect(res.body.ownerId).toBe(auth.userId);
    });

    it('повинен повертати список категорій та конкретну категорію', async () => {
        const auth = await registerAndLogin('owner2@example.com');
        const createRes = await request(app)
            .post('/categories')
            .set('Cookie', auth.accessCookie!)
            .send(validCategory)
            .expect(201);

        const listRes = await request(app).get('/categories').expect(200);
        expect(listRes.body.data.length).toBe(1);

        const getRes = await request(app).get(`/categories/${createRes.body.id}`).expect(200);
        expect(getRes.body.id).toBe(createRes.body.id);
    });

    it('повинен дозволяти оновлення та видалення тільки власнику', async () => {
        const owner = await registerAndLogin('owner3@example.com');
        const other = await registerAndLogin('owner4@example.com');

        const createRes = await request(app)
            .post('/categories')
            .set('Cookie', owner.accessCookie!)
            .send(validCategory)
            .expect(201);

        await request(app)
            .put(`/categories/${createRes.body.id}`)
            .set('Cookie', other.accessCookie!)
            .send({ name: 'Заборонено' })
            .expect(403);

        const updateRes = await request(app)
            .put(`/categories/${createRes.body.id}`)
            .set('Cookie', owner.accessCookie!)
            .send({ name: 'Нова назва' })
            .expect(200);

        expect(updateRes.body.name).toBe('Нова назва');

        await request(app)
            .delete(`/categories/${createRes.body.id}`)
            .set('Cookie', other.accessCookie!)
            .expect(403);

        await request(app)
            .delete(`/categories/${createRes.body.id}`)
            .set('Cookie', owner.accessCookie!)
            .expect(204);
    });

    it('повинен коректно фільтрувати та сортувати категорії', async () => {
        const auth = await registerAndLogin('owner5@example.com');

        await request(app).post('/categories').set('Cookie', auth.accessCookie!).send({ ...validCategory, name: 'Alpha' });
        await request(app).post('/categories').set('Cookie', auth.accessCookie!).send({ ...validCategory, name: 'Zulu' });
        await request(app).post('/categories').set('Cookie', auth.accessCookie!).send({ ...validCategory, type: 'income', name: 'Income' });

        const typeRes = await request(app).get('/categories?type=income').expect(200);
        expect(typeRes.body.data.length).toBe(1);
        expect(typeRes.body.data[0].type).toBe('income');

        const sortRes = await request(app).get('/categories?sort=-name').expect(200);
        expect(sortRes.body.data[0].name).toBe('Zulu');
    });

    it('повинен повертати дані зі специфічного маршруту /expenses', async () => {
        const auth = await registerAndLogin('owner6@example.com');

        await request(app).post('/categories').set('Cookie', auth.accessCookie!).send({ ...validCategory, type: 'expense' });
        await request(app).post('/categories').set('Cookie', auth.accessCookie!).send({ ...validCategory, type: 'income', name: 'Зарплата' });

        const res = await request(app).get('/categories/expenses').expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].type).toBe('expense');
    });
});