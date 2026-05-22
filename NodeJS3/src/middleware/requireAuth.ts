import { NextFunction, Request, Response } from 'express';
import { ACCESS_COOKIE_NAME, readCookieValue, verifyAccessToken } from '../utils/auth';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = readCookieValue(req.headers.cookie, ACCESS_COOKIE_NAME);

        if (!token) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};