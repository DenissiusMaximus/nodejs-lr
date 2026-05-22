import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { UserModel } from '../models/user.model';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

const cookieValue = (setCookieHeaders: string[] | undefined, cookieName: string) => {
    const header = setCookieHeaders?.find((value) => value.startsWith(`${cookieName}=`));
    return header?.split(';')[0];
};

const normalizeSetCookie = (value: string | string[] | undefined): string[] => {
    if (Array.isArray(value)) {
        return value;
    }

    return value ? [value] : [];
};

describe('Auth API Integration Tests', () => {
    const user = {
        email: 'auth@example.com',
        password: 'password123'
    };

    it('повинен зареєструвати користувача без passwordHash у відповіді', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(user)
            .expect(201);

        expect(res.body.email).toBe(user.email);
        expect(res.body.passwordHash).toBeUndefined();

        const savedUser = await UserModel.findOne({ email: user.email }).select('+passwordHash');
        expect(savedUser).not.toBeNull();
        expect(savedUser?.passwordHash).not.toBe(user.password);
    });

    it('повинен повернути 409 при повторній реєстрації', async () => {
        await request(app).post('/auth/register').send(user).expect(201);

        const res = await request(app)
            .post('/auth/register')
            .send(user)
            .expect(409);

        expect(res.body.message).toContain('електронною поштою');
    });

    it('повинен логінити користувача та ставити cookies з токенами', async () => {
        await request(app).post('/auth/register').send(user).expect(201);

        const res = await request(app)
            .post('/auth/login')
            .send(user)
            .expect(200);

        const setCookie = normalizeSetCookie(res.headers['set-cookie']);
        expect(cookieValue(setCookie, 'access_token')).toBeDefined();
        expect(cookieValue(setCookie, 'refresh_token')).toBeDefined();
        expect(setCookie.some((value) => value.includes('HttpOnly'))).toBe(true);
        expect(setCookie.some((value) => value.includes('SameSite=Strict'))).toBe(true);
        expect(res.body.accessToken).toBeUndefined();
    });

    it('повинен повертати 401 при неправильному паролі', async () => {
        await request(app).post('/auth/register').send(user).expect(201);

        await request(app)
            .post('/auth/login')
            .send({ email: user.email, password: 'wrong-password' })
            .expect(401);
    });

    it('повинен оновлювати токени через refresh', async () => {
        await request(app).post('/auth/register').send(user).expect(201);

        const loginRes = await request(app).post('/auth/login').send(user).expect(200);
        const setCookie = normalizeSetCookie(loginRes.headers['set-cookie']);
        const refreshCookie = cookieValue(setCookie, 'refresh_token');
        const accessCookie = cookieValue(setCookie, 'access_token');

        const refreshRes = await request(app)
            .post('/auth/refresh')
            .set('Cookie', [refreshCookie, accessCookie].filter(Boolean).join('; '))
            .expect(200);

        const refreshSetCookie = normalizeSetCookie(refreshRes.headers['set-cookie']);
        expect(cookieValue(refreshSetCookie, 'access_token')).toBeDefined();
        expect(cookieValue(refreshSetCookie, 'refresh_token')).toBeDefined();
    });

    it('повинен очищати cookies при logout', async () => {
        await request(app).post('/auth/register').send(user).expect(201);
        const loginRes = await request(app).post('/auth/login').send(user).expect(200);
        const setCookie = normalizeSetCookie(loginRes.headers['set-cookie']);
        const refreshCookie = cookieValue(setCookie, 'refresh_token');
        const accessCookie = cookieValue(setCookie, 'access_token');

        const logoutRes = await request(app)
            .post('/auth/logout')
            .set('Cookie', [refreshCookie, accessCookie].filter(Boolean).join('; '))
            .expect(200);

        const logoutSetCookie = normalizeSetCookie(logoutRes.headers['set-cookie']);
        expect(logoutSetCookie.some((value) => value.startsWith('access_token=;'))).toBe(true);
        expect(logoutSetCookie.some((value) => value.startsWith('refresh_token=;'))).toBe(true);
    });
});