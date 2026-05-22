import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

beforeAll(async () => await connectTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await closeTestDB());

describe('User Model Unit Tests', () => {
    it('повинен хешувати пароль у pre save hook', async () => {
        const user = await UserModel.create({
            email: 'hook@example.com',
            passwordHash: 'password123'
        });

        const storedUser = await UserModel.findById(user.id).select('+passwordHash');

        expect(storedUser).not.toBeNull();
        expect(storedUser?.passwordHash).not.toBe('password123');
        expect(await bcrypt.compare('password123', storedUser!.passwordHash)).toBe(true);
    });

    it('повинен вимагати email та пароль', async () => {
        const user = new UserModel({ email: 'missing@example.com' });

        let err: any;
        try { await user.save(); } catch (error) { err = error; }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.passwordHash).toBeDefined();
    });
});