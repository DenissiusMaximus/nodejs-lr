import { z } from 'zod';

const emailSchema = z.string().email('Невірний формат електронної пошти');
const passwordSchema = z.string().min(6, 'Пароль має містити щонайменше 6 символів');

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export const loginSchema = registerSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;