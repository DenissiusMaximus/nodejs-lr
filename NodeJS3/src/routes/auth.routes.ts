import bcrypt from 'bcryptjs';
import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { UserModel } from '../models/user.model';
import { clearAuthCookies, generateAuthTokens, readCookieValue, REFRESH_COOKIE_NAME, setAuthCookies, verifyRefreshToken } from '../utils/auth';

export const createAuthRouter = () => {
    const router = Router();

    router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email.trim().toLowerCase();
            const password = req.body.password;

            const user = new UserModel({ email, passwordHash: password });
            await user.save();

            res.status(201).json(user.toJSON());
        } catch (error) {
            if ((error as any)?.code === 11000) {
                res.status(409).json({ status: 'error', message: 'Користувач з такою електронною поштою вже існує' });
                return;
            }

            next(error);
        }
    });

    router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email.trim().toLowerCase();
            const password = req.body.password;

            const user = await UserModel.findOne({ email }).select('+passwordHash');

            if (!user) {
                res.status(401).json({ status: 'error', message: 'Невірні облікові дані' });
                return;
            }

            const passwordMatches = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatches) {
                res.status(401).json({ status: 'error', message: 'Невірні облікові дані' });
                return;
            }

            setAuthCookies(res, generateAuthTokens(user.id));
            res.status(200).json({ status: 'ok' });
        } catch (error) {
            next(error);
        }
    });

    router.post('/refresh', async (req: Request, res: Response) => {
        try {
            const refreshToken = readCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME);

            if (!refreshToken) {
                res.status(401).json({ status: 'error', message: 'Unauthorized' });
                return;
            }

            const payload = verifyRefreshToken(refreshToken);
            setAuthCookies(res, generateAuthTokens(payload.userId));
            res.status(200).json({ status: 'ok' });
        } catch {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
    });

    router.post('/logout', (_req: Request, res: Response) => {
        clearAuthCookies(res);
        res.status(200).json({ status: 'ok' });
    });

    return router;
};